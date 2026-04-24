import { useState, useEffect } from 'react';
import { parseDataToStore } from '../utils';
import recipesData from '../data/recipes.json';

/**
 * 静的なレシピJSONを読み込み、recipeMapとavailableItemsを返す。
 */
export const useRecipeData = () => {
  const [recipeMap, setRecipeMap] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    try {
      const { recipeMap: parsedMap, availableItems: parsedItems } = parseDataToStore(recipesData);
      setRecipeMap(parsedMap);
      setAvailableItems(parsedItems);
    } catch (error) {
      console.error('Failed to parse static recipes data:', error);
    }
  }, []);

  return { recipeMap, availableItems };
};
