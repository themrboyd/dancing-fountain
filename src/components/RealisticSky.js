import React, { useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'

const RealisticSky = () => {
  const { scene } = useThree()
  const skyRef = useRef()

  // ลบพื้นหลังสีเดิมออก
  scene.background = null

  return (
    <Sky
      ref={skyRef}
      distance={450000} // ระยะห่างของท้องฟ้า
      sunPosition={[0, 1, 0]} // ตำแหน่งดวงอาทิตย์ [x, y, z]
      inclination={0.6} // มุมเอียงของดวงอาทิตย์
      azimuth={0.1} // มุมแนวนอนของดวงอาทิตย์
      mieCoefficient={0.005} // ความเข้มของการกระจายแสง
      mieDirectionalG={0.8} // ทิศทางของการกระจายแสง
      rayleigh={3} // ความเข้มของสีฟ้าในท้องฟ้า
      turbidity={8} // ความขุ่นของบรรยากาศ
    />
  )
}

export default RealisticSky