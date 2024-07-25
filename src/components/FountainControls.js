// FountainControls.js
import React from 'react';

const FountainControls = ({ onChangeFountainType }) => {
  const fountainTypes = ['basic', 'dome', 'spinning', 'wave', 'random'];

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '10px',
      borderRadius: '5px'
    }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <span style={{ color: 'white', marginRight: '10px' }}>Fountain {index + 1}:</span>
          {fountainTypes.map((type) => (
            <button
              key={type}
              onClick={() => onChangeFountainType(index, type)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FountainControls;