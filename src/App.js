// App.js
import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import RealisticFountains from './components/DancingFountain'
import AudioManager from './components/AudioManager'
import FountainControls from './components/FountainControls'

function App() {
  const [audioData, setAudioData] = useState(null)
  const [fountainTypes, setFountainTypes] = useState(['basic', 'dome', 'spinning', 'wave', 'random'])

  const handleAudioData = useCallback((data) => {
    setAudioData(data)
  }, [])

  const handleChangeFountainType = useCallback((index, newType) => {
    setFountainTypes(prevTypes => {
      const newTypes = [...prevTypes];
      newTypes[index] = newType;
      return newTypes;
    });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AudioManager onAudioData={handleAudioData} />
      <Canvas camera={{ position: [0, 40, 60], fov: 120 }}>
        <RealisticFountains audioData={audioData} fountainTypes={fountainTypes} />
      </Canvas>
      <FountainControls onChangeFountainType={handleChangeFountainType} />
    </div>
  )
}

export default App