import { useState, useEffect } from 'react';
import { parseDataToStore } from '../utils';

// サポートするゲームとそのJSONの動的インポートマップ
const GAME_LOADERS = {
  soulmask: () => import('../recipe/soulmask.json'),
  satisfactory: () => import('../recipe/satisfactory.json'),
};

/**
 * 指定されたゲームのレシピJSONを動的に読み込み、recipeMapとavailableItemsを返す。
 * @param {string} game - ゲーム識別子（'soulmask' | 'satisfactory'）
 */
export const useRecipeData = (game) => {
  const [recipeMap, setRecipeMap] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!game || !GAME_LOADERS[game]) {
      setError(`未対応のゲーム: ${game}`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setRecipeMap(null);
    setAvailableItems([]);

    GAME_LOADERS[game]()
      .then((module) => {
        const data = module.default;
        const { recipeMap: parsedMap, availableItems: parsedItems } = parseDataToStore(data);
        setRecipeMap(parsedMap);
        setAvailableItems(parsedItems);
      })
      .catch((err) => {
        console.error('Failed to load recipe data:', err);
        setError('レシピデータの読み込みに失敗しました。');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [game]);

  return { recipeMap, availableItems, loading, error };
};

export const SUPPORTED_GAMES = Object.keys(GAME_LOADERS);
