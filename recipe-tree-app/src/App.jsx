import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UploadCloud, ArrowLeft, Network } from 'lucide-react';
import CustomNode from './CustomNode';
import SidePanel from './SidePanel';
import { parseYamlToGraph, getLayoutedElements } from './utils';

const nodeTypes = {
  customNode: CustomNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recipeMap, setRecipeMap] = useState(null);
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

  const loadGraph = (yamlString) => {
    try {
      const { initialNodes, initialEdges, recipeMap: parsedMap } = parseYamlToGraph(yamlString);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setRecipeMap(parsedMap);
      setIsLoaded(true);
    } catch (error) {
      alert("YAMLの解析に失敗しました。正しい形式ですか？\n" + error.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      readFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => loadGraph(e.target.result);
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  if (!isLoaded) {
    return (
      <div className="dropzone-container">
        <label 
          className={`glass-panel dropzone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="icon-container">
            <UploadCloud size={64} />
          </div>
          <h2>recipes.yml をアップロード</h2>
          <p>ドラッグ＆ドロップ、またはクリックしてファイルを選択</p>
          <input 
            type="file" 
            accept=".yml,.yaml" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div className="glass-panel app-header">
        <Network size={24} color="#93C5FD" />
        <h1>Recipe Tree Explorer</h1>
        <button className="btn" onClick={() => setIsLoaded(false)}>
          <ArrowLeft size={16} /> 別のファイルを読み込む
        </button>
      </div>
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
        minZoom={0.1}
        colorMode="dark"
      >
        <Background gap={24} size={2} color="rgba(255,255,255,0.05)" />
        <Controls showInteractive={false} />
      </ReactFlow>
      
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
