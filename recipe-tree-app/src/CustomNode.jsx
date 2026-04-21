import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Hammer, Package } from 'lucide-react';

const CustomNode = ({ data, isConnectable }) => {
  const isResult = data.isResult;

  return (
    <div className={`custom-node ${isResult ? 'result-node' : ''}`}>
      {/* Target handle: where inputs come in (bottom for BT layout) */}
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ width: '8px', height: '8px', background: '#94a3b8', border: 'none' }}
      />
      
      <div className="node-label">
        {data.label}
      </div>

      {isResult && data.crafting && (
        <div className="crafting-station">
          <Hammer size={12} />
          <span>{data.crafting}</span>
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
