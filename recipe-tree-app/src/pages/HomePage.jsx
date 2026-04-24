import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Sword, Zap, ArrowRight } from 'lucide-react';

const GAMES = [
  {
    id: 'soulmask',
    name: 'Soulmask',
    description: '部族サバイバルRPGのクラフトレシピを探索する',
    icon: Sword,
    accentColor: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    accentBorder: 'rgba(245, 158, 11, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(180,83,9,0.1) 100%)',
  },
  {
    id: 'satisfactory',
    name: 'Satisfactory',
    description: '工場建設ゲームのレシピと生産ラインを可視化する',
    icon: Zap,
    accentColor: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.15)',
    accentBorder: 'rgba(249, 115, 22, 0.35)',
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(194,65,12,0.1) 100%)',
  },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* 背景デコレーション */}
      <div className="home-bg-orb home-bg-orb--1" />
      <div className="home-bg-orb home-bg-orb--2" />

      <div className="home-content">
        {/* ヘッダー */}
        <div className="home-hero">
          <div className="home-icon-wrap">
            <Network size={40} color="#93C5FD" />
          </div>
          <h1 className="home-title">Recipe Tree Explorer</h1>
          <p className="home-subtitle">
            ゲームのクラフトレシピを素材の構成ツリーとして可視化するツールです。<br />
            探索したいゲームを選択してください。
          </p>
        </div>

        {/* ゲーム選択カード */}
        <div className="game-cards">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                className="game-card"
                onClick={() => navigate(`/${game.id}`)}
                style={{
                  background: game.gradient,
                  borderColor: game.accentBorder,
                }}
              >
                <div
                  className="game-card-icon"
                  style={{
                    background: game.accentBg,
                    border: `1px solid ${game.accentBorder}`,
                    color: game.accentColor,
                  }}
                >
                  <Icon size={32} />
                </div>

                <div className="game-card-body">
                  <h2
                    className="game-card-name"
                    style={{ color: game.accentColor }}
                  >
                    {game.name}
                  </h2>
                  <p className="game-card-desc">{game.description}</p>
                </div>

                <div className="game-card-arrow" style={{ color: game.accentColor }}>
                  <ArrowRight size={24} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
