import React from 'react';
import { Network, ArrowLeft } from 'lucide-react';

/**
 * 上部の検索フォームと操作ボタンを表示するヘッダーコンポーネント。
 */
const Header = ({ searchInput, setSearchInput, filteredItems, onSearch, onClear }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="glass-panel app-header" style={{ display: 'flex', width: 'calc(100% - 48px)' }}>
      <Network size={24} color="#93C5FD" />
      <h1>Recipe Tree Explorer</h1>

      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          list="item-list"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="アイテム名で検索..."
          className="search-input"
        />
        <datalist id="item-list">
          {filteredItems.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <button type="submit" className="btn search-btn">
          ツリーを表示
        </button>
      </form>

      <button
        className="btn"
        onClick={() => {
          onClear();
          setSearchInput('');
        }}
      >
        <ArrowLeft size={16} /> クリア
      </button>
    </div>
  );
};

export default Header;
