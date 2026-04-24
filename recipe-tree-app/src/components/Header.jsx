import React, { useState, useRef, useEffect } from 'react';
import { Network, ArrowLeft, Sword, Zap } from 'lucide-react';

const GAME_ICONS = {
  soulmask: Sword,
  satisfactory: Zap,
};

/**
 * 上部の検索フォームを表示するヘッダーコンポーネント。
 */
const Header = ({ game, gameLabel, searchInput, setSearchInput, filteredItems, onSearch, onBack }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const GameIcon = GAME_ICONS[game] ?? Network;

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
      {/* 戻るボタン */}
      <button className="btn back-btn" onClick={onBack} title="ゲーム選択に戻る">
        <ArrowLeft size={16} />
        <span>戻る</span>
      </button>

      {/* ゲームアイコン＋タイトル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
        <GameIcon size={20} color="#93C5FD" />
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
          {gameLabel} — Recipe Tree
        </h1>
      </div>

      {/* 検索フォーム */}
      <div ref={wrapperRef} className="search-form" style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchInput.trim()) {
              setOpen(false);
              onSearch(searchInput.trim());
            }
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
