import React,{useState} from 'react'
import { Canvas } from '@react-three/fiber'
import RealisticFountains from './components/DancingFountain'
import AudioManager from './components/AudioManager'  // เพิ่มการ import AudioManager

function App() {
  const [audioData, setAudioData] = useState(null)  // เพิ่ม state สำหรับเก็บข้อมูลเสียง

   // ฟังก์ชันสำหรับรับข้อมูลเสียงจาก AudioManager
   const handleAudioData = (data) => {
    setAudioData(data)
  }
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AudioManager onAudioData={handleAudioData} />  {/* เพิ่ม AudioManager component */}
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <RealisticFountains audioData={audioData} />  {/* ส่ง audioData ไปยัง RealisticFountains */}
      </Canvas>
    </div>
  )
}

export default App