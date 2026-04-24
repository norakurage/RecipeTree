import React, { useState, useRef, useEffect } from 'react';
import { Network, ArrowLeft } from 'lucide-react';

/**
 * 上部の検索フォームと操作ボタンを表示するヘッダーコンポーネント。
 */
const Header = ({ searchInput, setSearchInput, filteredItems, onSearch, onClear }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpen(false);
    onSearch(searchInput);
  };

  const handleSelect = (item) => {
    setSearchInput(item);
    setOpen(false);
    onSearch(item);
  };

  return (
    <div className="glass-panel app-header" style={{ display: 'flex', width: 'calc(100% - 48px)' }}>
      <Network size={24} color="#93C5FD" />
      <h1>Recipe Tree Explorer</h1>

      <form onSubmit={handleSubmit} className="search-form" style={{ position: 'relative' }}>
        <div ref={wrapperRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="アイテム名で検索..."
            className="search-input"
            autoComplete="off"
          />
          <button type="submit" className="btn search-btn">
            ツリーを表示
          </button>

          {open && filteredItems.length > 0 && (
            <ul className="suggestion-list">
              {filteredItems.map((item) => (
                <li
                  key={item}
                  className="suggestion-item"
                  onMouseDown={() => handleSelect(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      <button
        className="btn"
        onClick={() => {
          onClear();
          setSearchInput('');
          setOpen(false);
        }}
      >
        <ArrowLeft size={16} /> クリア
      </button>
    </div>
  );
};

export default Header;
