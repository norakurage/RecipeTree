import React from 'react';
import { X, PackageOpen, Hammer } from 'lucide-react';
import { calculateTotalMaterials } from './utils';

const SidePanel = ({ selectedItem, recipeMap, onClose }) => {
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
              const totalMaterials = calculateTotalMaterials(selectedItem, recipeMap);
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
                    {isRawMaterial ? (
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

                  {recipeObj && recipeObj.recipe && recipeObj.recipe.length > 0 && (
                    <div className="section">
                      <h3>
                        <PackageOpen size={18} /> 
                        直接必要となる素材
                      </h3>
                      <ul className="materials-list">
                        {recipeObj.recipe.map(ingredient => (
                          <li key={ingredient.item}>
                            <span className="material-name">{ingredient.item}</span>
                            <span className="material-qty">{ingredient.required}個</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
