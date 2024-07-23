import React from 'react'
import { Canvas } from '@react-three/fiber'
import RealisticFountains from './components/DancingFountain'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <RealisticFountains />
      </Canvas>
    </div>
  )
}

export default App