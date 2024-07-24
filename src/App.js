import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import RealisticFountains from './components/DancingFountain'
import AudioManager from './components/AudioManager'

function App() {
  const [audioData, setAudioData] = useState(null)

  // ใช้ useCallback เพื่อ memoize ฟังก์ชัน
  const handleAudioData = useCallback((data) => {
    setAudioData(data)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AudioManager onAudioData={handleAudioData} />
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <RealisticFountains audioData={audioData} />
      </Canvas>
    </div>
  )
}

export default App