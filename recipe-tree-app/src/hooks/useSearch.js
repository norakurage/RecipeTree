import { useState, useMemo } from 'react';

/**
 * 検索フォームの入力状態と候補の絞り込みを管理するカスタムフック。
 * @param {string[]} availableItems - 検索対象アイテム一覧
 */
export const useSearch = (availableItems) => {
  const [searchInput, setSearchInput] = useState('');

  // 検索候補を絞り込む処理（最大表示件数を100件に制限し、入力がある時のみ表示して動作を軽量化）
  const filteredItems = useMemo(() => {
    if (!searchInput) return []; // 未入力時は候補を表示しない
    const lowerInput = searchInput.toLowerCase();

    const matched = [];
    // availableItemsから部分一致するものを最大100件抽出
    for (let i = 0; i < availableItems.length; i++) {
      const item = availableItems[i];
      if (item == null) continue; // undefinedやnullをスキップ

      // 文字列キャストを挟んでtoLowerCaseエラーを防ぐ（JSON側に数値やnullが混入していることへの対策）
      if (String(item).toLowerCase().includes(lowerInput)) {
        matched.push(item);
        if (matched.length >= 100) break;
      }
    }
    return matched;
  }, [searchInput, availableItems]);

  return { searchInput, setSearchInput, filteredItems };
};
