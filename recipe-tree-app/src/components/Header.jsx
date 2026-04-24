import React, { useState, useRef, useEffect } from 'react';
import { Network } from 'lucide-react';

/**
 * 上部の検索フォームを表示するヘッダーコンポーネント。
 */
const Header = ({ searchInput, setSearchInput, filteredItems, onSearch }) => {
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

  const handleSelect = (item) => {
    setSearchInput(item);
    setOpen(false);
    onSearch(item);
  };

  return (
    <div className="glass-panel app-header" style={{ display: 'flex', width: 'calc(100% - 48px)' }}>
      <Network size={24} color="#93C5FD" />
      <h1>Recipe Tree Explorer</h1>

      <div ref={wrapperRef} className="search-form" style={{ position: 'relative' }}>
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
    </div>
  );
};

export default Header;
