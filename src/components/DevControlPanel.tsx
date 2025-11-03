// src/components/DevControlPanel.tsx
import React from 'react';

interface Props {
  onSimulateAfblast: () => void;
}

const DevControlPanel: React.FC<Props> = ({ onSimulateAfblast }) => {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <button
        onClick={onSimulateAfblast}
        style={{
          padding: '6px 12px',
          backgroundColor: '#e91e63',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Simulate Afblast
      </button>
    </div>
  );
};

export default DevControlPanel;
