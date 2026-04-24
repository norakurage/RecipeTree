import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Hammer, Check } from 'lucide-react';

/**
 * ReactFlowのカスタムノードUI。
 * isResult: レシピ情報があるノード（作成可能なアイテム）かどうか
 * isCompleted: 右クリックでトグルされた完了状態
 * isFaded: 完了状態などによりフェードアウト表示するかどうか
 */
const CustomNode = ({ data, isConnectable }) => {
  const isResult = data.isResult;
  const isCompleted = data.isCompleted;
  const isFaded = data.isFaded;

  return (
    <div className={`custom-node ${isResult ? 'result-node' : ''} ${isFaded ? 'completed-node' : ''}`}>
      {/* Target handle: where inputs come in (bottom for BT layout) */}
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ width: '8px', height: '8px', background: '#94a3b8', border: 'none' }}
      />

      <div className="node-label">{data.label}</div>

      {isResult && data.crafting && (
        <div className="crafting-station">
          <Hammer size={12} />
          <span>{data.crafting}</span>
        </div>
      )}

      {isCompleted && (
        <div className="completed-overlay">
          <Check size={32} color="#10b981" />
        </div>
      )}

      {/* Source handle: where outputs go out (top for BT layout) */}
      <Handle
        type="source"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ width: '8px', height: '8px', background: isResult ? '#60a5fa' : '#94a3b8', border: 'none' }}
      />
    </div>
  );
};

export default memo(CustomNode);
