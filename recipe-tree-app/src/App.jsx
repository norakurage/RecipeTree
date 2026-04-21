import React, { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UploadCloud, ArrowLeft, Network } from 'lucide-react';
import CustomNode from './CustomNode';
import { parseYamlToGraph, getLayoutedElements } from './utils';

const nodeTypes = {
  customNode: CustomNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const loadGraph = (yamlString) => {
    try {
      const { initialNodes, initialEdges } = parseYamlToGraph(yamlString);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
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
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        colorMode="dark"
      >
        <Background gap={24} size={2} color="rgba(255,255,255,0.05)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export default App;
