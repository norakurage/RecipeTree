import React from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Header from '../components/Header';
import CustomNode from '../components/CustomNode';
import SidePanel from '../components/SidePanel';
import { useRecipeData, SUPPORTED_GAMES } from '../hooks/useRecipeData';
import { useSearch } from '../hooks/useSearch';
import { useRecipeFlow } from '../hooks/useRecipeFlow';
import { Loader2 } from 'lucide-react';

const nodeTypes = {
  customNode: CustomNode,
};

const GAME_LABELS = {
  soulmask: 'Soulmask',
  satisfactory: 'Satisfactory',
};

const RecipeTreePage = () => {
  const { game } = useParams();
  const navigate = useNavigate();

  // 未対応のゲームならトップに戻す
  if (!SUPPORTED_GAMES.includes(game)) {
    return <Navigate to="/" replace />;
  }

  const { recipeMap, availableItems, loading, error } = useRecipeData(game);
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

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <Loader2 size={48} className="spin-icon" />
          <p>{GAME_LABELS[game] ?? game} のレシピデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <p style={{ color: '#f87171' }}>{error}</p>
          <button className="btn" onClick={() => navigate('/')}>
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Header
        game={game}
        gameLabel={GAME_LABELS[game] ?? game}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filteredItems={filteredItems}
        onSearch={buildTree}
        onClear={clearTree}
        onBack={() => navigate('/')}
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
          key={activeRootItem}
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
};

export default RecipeTreePage;
