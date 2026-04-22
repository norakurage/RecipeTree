import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Network } from 'lucide-react';
import CustomNode from './CustomNode';
import SidePanel from './SidePanel';
import { parseDataToStore, buildSubGraph, getLayoutedElements } from './utils';
import recipesData from '../recipes.json';

const nodeTypes = {
  customNode: CustomNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [recipeMap, setRecipeMap] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    try {
      const { recipeMap: parsedMap, availableItems: parsedItems } = parseDataToStore(recipesData);
      setRecipeMap(parsedMap);
      setAvailableItems(parsedItems);
    } catch (error) {
      console.error("Failed to parse static recipes data:", error);
    }
  }, []);
  
  const [searchInput, setSearchInput] = useState('');
  const [activeRootItem, setActiveRootItem] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

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

  const completedNodeIds = new Set(nodes.filter(n => n.data?.isCompleted).map(n => n.id));

  // Compute active nodes and edges for fading
  const { displayNodes, displayEdges } = useMemo(() => {
    // Parent -> Ingredients (Target -> Sources)
    const parentToIngredients = {};
    const edgeMap = {};

    edges.forEach(e => {
      if (!parentToIngredients[e.target]) parentToIngredients[e.target] = [];
      parentToIngredients[e.target].push(e.source);
      edgeMap[`${e.target}->${e.source}`] = e.id;
    });

    const activeNodes = new Set();
    const activeEdges = new Set();

    // Find roots (nodes with no out-edges)
    const outEdges = new Map();
    edges.forEach(e => {
      outEdges.set(e.source, (outEdges.get(e.source) || 0) + 1);
    });
    const roots = nodes.filter(n => !outEdges.has(n.id)).map(n => n.id);

    const propagateDemand = (nodeId) => {
      // If it's explicitly completed, it doesn't demand ingredients
      if (completedNodeIds.has(nodeId)) {
        return;
      }
      
      activeNodes.add(nodeId);

      const ingredients = parentToIngredients[nodeId] || [];
      ingredients.forEach(ingId => {
        const eId = edgeMap[`${nodeId}->${ingId}`];
        activeEdges.add(eId);
        if (!activeNodes.has(ingId)) {
          propagateDemand(ingId);
        }
      });
    };

    roots.forEach(root => propagateDemand(root));

    const dNodes = nodes.map(n => {
      const isExplicit = completedNodeIds.has(n.id);
      const isActive = activeNodes.has(n.id);
      const isFaded = isExplicit || !isActive;
      
      return {
        ...n,
        data: {
          ...n.data,
          isFaded,
        }
      };
    });

    const dEdges = edges.map(e => ({
      ...e,
      className: activeEdges.has(e.id) ? '' : 'faded-edge',
    }));

    return { displayNodes: dNodes, displayEdges: dEdges };
  }, [nodes, edges, completedNodeIds]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput || !availableItems.includes(searchInput)) {
      alert("有効なアイテム名を入力するか、リストから選択してください。");
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
      alert("ツリーの構築中にエラーが発生しました。");
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div className="glass-panel app-header" style={{ display: 'flex', width: 'calc(100% - 48px)' }}>
        <Network size={24} color="#93C5FD" />
        <h1>Recipe Tree Explorer</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            list="item-list"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="アイテム名で検索..."
            className="search-input"
          />
          <datalist id="item-list">
            {availableItems.map(item => <option key={item} value={item} />)}
          </datalist>
          <button type="submit" className="btn search-btn">ツリーを表示</button>
        </form>

        <button className="btn" onClick={() => { 
          setActiveRootItem(null);
          setSearchInput('');
          setNodes([]);
          setEdges([]);
        }}>
          <ArrowLeft size={16} /> クリア
        </button>
      </div>

      {!activeRootItem ? (
        <div className="empty-canvas-container">
          <div className="glass-panel empty-canvas-message">
            <h2>アイテムを検索してください</h2>
            <p>画面上部の検索ボックスからアイテムを選択して「ツリーを表示」をクリックすると、そのアイテムに必要な素材の構成ツリーが表示されます。</p>
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={() => setSelectedNodeId(null)}
          nodeTypes={nodeTypes}
          fitView
          key={activeRootItem} // Force re-render/re-fitView when root changes
          minZoom={0.1}
          colorMode="dark"
        >
          <Background gap={24} size={2} color="rgba(255,255,255,0.05)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      )}
      
      <SidePanel 
        selectedItem={selectedNodeId} 
        recipeMap={recipeMap} 
        completedItems={completedNodeIds}
        onClose={() => setSelectedNodeId(null)} 
      />
    </div>
  );
}

export default App;
