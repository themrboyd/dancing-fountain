// นำเข้าโมดูลที่จำเป็น
import React, { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import RealisticFountains from './components/DancingFountain'
import AudioManager from './components/AudioManager'

// คอมโพเนนต์หลักของแอปพลิเคชัน
function App() {
  // สร้าง state สำหรับเก็บข้อมูลเสียง
  const [audioData, setAudioData] = useState(null)

  // ใช้ useCallback เพื่อ memoize ฟังก์ชัน handleAudioData
  // ช่วยลดการ re-render ที่ไม่จำเป็น
  const handleAudioData = useCallback((data) => {
    setAudioData(data)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* คอมโพเนนต์ AudioManager สำหรับจัดการเสียง */}
      <AudioManager onAudioData={handleAudioData} />
      
      {/* Canvas สำหรับแสดงผล 3D */}
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        {/* คอมโพเนนต์ RealisticFountains สำหรับแสดงน้ำพุ */}
        <RealisticFountains audioData={audioData} />
      </Canvas>
    </div>
  )
}

export default App