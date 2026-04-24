import { useState, useCallback, useMemo } from 'react';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { buildSubGraph, getLayoutedElements } from '../utils';

/**
 * ツリーの構築、フェードアウト計算、React Flowの状態管理を担当するカスタムフック。
 * @param {Map} recipeMap - アイテム名をキーにしたレシピMapオブジェクト
 * @param {string[]} availableItems - 検索対象アイテム一覧
 */
export const useRecipeFlow = (recipeMap, availableItems) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [activeRootItem, setActiveRootItem] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // ノード変更ハンドラ
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // エッジ変更ハンドラ
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // 右クリックでノードの完了状態をトグル
  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                isCompleted: !n.data.isCompleted,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  // 完了済みノードIDのSet
  const completedNodeIds = new Set(nodes.filter((n) => n.data?.isCompleted).map((n) => n.id));

  // ① エッジと完了状態からアクティブなノードとエッジを計算（ノードのドラッグ等による再計算を防ぐ）
  const { activeNodes, activeEdges } = useMemo(() => {
    const parentToIngredients = {};
    const edgeMap = {};

    edges.forEach((e) => {
      if (!parentToIngredients[e.target]) parentToIngredients[e.target] = [];
      parentToIngredients[e.target].push(e.source);
      edgeMap[`${e.target}->${e.source}`] = e.id;
    });

    const activeNodesSet = new Set();
    const activeEdgesSet = new Set();

    // 出エッジを持たないノードをルートとして扱う
    const outEdges = new Map();
    edges.forEach((e) => {
      outEdges.set(e.source, (outEdges.get(e.source) || 0) + 1);
    });
    // 動的に変化しない nodes.length を依存配列にすることで、ドラッグ中の計算をスキップ
    const roots = nodes.filter((n) => !outEdges.has(n.id)).map((n) => n.id);

    const propagateDemand = (nodeId) => {
      // 明示的に完了済みならその先の素材は不要
      if (completedNodeIds.has(nodeId)) {
        return;
      }

      activeNodesSet.add(nodeId);

      const ingredients = parentToIngredients[nodeId] || [];
      ingredients.forEach((ingId) => {
        // 素材ノードが完了済みならそのエッジもフェード対象（追加しない）
        if (completedNodeIds.has(ingId)) return;
        const eId = edgeMap[`${nodeId}->${ingId}`];
        activeEdgesSet.add(eId);
        if (!activeNodesSet.has(ingId)) {
          propagateDemand(ingId);
        }
      });
    };

    roots.forEach((root) => propagateDemand(root));

    return { activeNodes: activeNodesSet, activeEdges: activeEdgesSet };
  }, [edges, completedNodeIds, nodes.length]);

  // ② 表示用ノードの生成。オブジェクトの参照を極力変えずにReact Flowの再レンダリング負荷を下げる（軽量化）
  const displayNodes = useMemo(() => {
    return nodes.map((n) => {
      const isExplicit = completedNodeIds.has(n.id);
      const isActive = activeNodes.has(n.id);
      const isFaded = isExplicit || !isActive;

      if (n.data?.isFaded === isFaded) return n; // 状態が変わらなければ既存の参照を返す

      return {
        ...n,
        data: {
          ...n.data,
          isFaded,
        },
      };
    });
  }, [nodes, activeNodes, completedNodeIds]);

  // ③ 表示用エッジの生成。同様に参照を維持する
  const displayEdges = useMemo(() => {
    return edges.map((e) => {
      const isFaded = !activeEdges.has(e.id);
      const className = isFaded ? 'faded-edge' : '';

      // labelStyle はインラインスタイルのため CSS より優先される。faded 時は明示的に上書きが必要
      const labelStyle = isFaded
        ? { fontSize: 16, fontWeight: 800, fill: 'rgba(148, 163, 184, 0.35)' }
        : { fontSize: 16, fontWeight: 800, fill: '#e2e8f0' };
      const labelBgStyle = isFaded
        ? { fill: 'rgba(30, 41, 59, 0.25)' }
        : { fill: '#1e293b' };

      if (e.className === className) return e; // 状態が変わらなければ既存の参照を返す

      return {
        ...e,
        className,
        labelStyle,
        labelBgStyle,
      };
    });
  }, [edges, activeEdges]);

  // 検索実行：サブグラフを構築してレイアウト
  const buildTree = useCallback(
    (searchInput) => {
      if (!searchInput || !availableItems.includes(searchInput)) {
        alert('有効なアイテム名を入力するか、リストから選択してください。');
        return;
      }

      try {
        const { initialNodes, initialEdges } = buildSubGraph(searchInput, recipeMap);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          initialNodes,
          initialEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setActiveRootItem(searchInput);
        setSelectedNodeId(null);
      } catch (error) {
        console.error(error);
        alert('ツリーの構築中にエラーが発生しました。');
      }
    },
    [recipeMap, availableItems]
  );

  // ツリーとUIをリセット
  const clearTree = useCallback(() => {
    setActiveRootItem(null);
    setNodes([]);
    setEdges([]);
  }, []);

  return {
    displayNodes,
    displayEdges,
    activeRootItem,
    selectedNodeId,
    setSelectedNodeId,
    completedNodeIds,
    onNodesChange,
    onEdgesChange,
    onNodeContextMenu,
    buildTree,
    clearTree,
  };
};
