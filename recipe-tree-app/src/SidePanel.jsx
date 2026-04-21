import React from 'react';
import { X, PackageOpen, Hammer } from 'lucide-react';
import { calculateTotalMaterials } from './utils';

const SidePanel = ({ selectedItem, recipeMap, completedItems, onClose }) => {
  return (
    <div className={`side-panel glass-panel ${selectedItem ? 'open' : ''}`}>
      {selectedItem && (
        <>
          <div className="panel-header">
            <h2>{selectedItem}</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className="panel-content">
            {(() => {
              const recipeObj = recipeMap.get(selectedItem);
              const totalMaterials = calculateTotalMaterials(selectedItem, recipeMap, 1, completedItems);
              const baseItemsKeys = Object.keys(totalMaterials);
              const isRawMaterial = baseItemsKeys.length === 1 && baseItemsKeys[0] === selectedItem;

              return (
                <>
                  {recipeObj && recipeObj.crafting && (
                    <div className="crafting-info">
                      <Hammer size={16} />
                      <span>作成施設: {recipeObj.crafting}</span>
                    </div>
                  )}

                  <div className="section">
                    <h3>
                      <PackageOpen size={18} /> 
                      必要総素材数（基礎素材まで分解）
                    </h3>
                    {baseItemsKeys.length === 0 ? (
                      <p className="empty-text">すでに揃っています（または必要な素材がありません）。</p>
                    ) : isRawMaterial ? (
                      <p className="empty-text">これは基礎素材です。</p>
                    ) : (
                      <ul className="materials-list">
                        {baseItemsKeys.map(item => (
                          <li key={item}>
                            <span className="material-name">{item}</span>
                            <span className="material-qty">{totalMaterials[item]}個</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>


                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default SidePanel;
