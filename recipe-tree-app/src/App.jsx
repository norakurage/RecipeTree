import React from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Header from './components/Header';
import CustomNode from './components/CustomNode';
import SidePanel from './components/SidePanel';
import { useRecipeData } from './hooks/useRecipeData';
import { useSearch } from './hooks/useSearch';
import { useRecipeFlow } from './hooks/useRecipeFlow';

const nodeTypes = {
  customNode: CustomNode,
};

function App() {
  const { recipeMap, availableItems } = useRecipeData();
  const { searchInput, setSearchInput, filteredItems } = useSearch(availableItems);
  const {
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
  } = useRecipeFlow(recipeMap, availableItems);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Header
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filteredItems={filteredItems}
        onSearch={buildTree}
        onClear={clearTree}
      />

      {!activeRootItem ? (
        <div className="empty-canvas-container">
          <div className="glass-panel empty-canvas-message">
            <h2>アイテムを検索してください</h2>
            <p>
              画面上部の検索ボックスからアイテムを選択して「ツリーを表示」をクリックすると、そのアイテムに必要な素材の構成ツリーが表示されます。
            </p>
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
          key={activeRootItem} // ルート変更時に再レンダリング・fitViewを強制
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
