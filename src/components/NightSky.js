import React from 'react'
import { useThree } from '@react-three/fiber'
import { Sky, Stars } from '@react-three/drei'

const NightSky = () => {
  const { scene } = useThree()

  // ลบพื้นหลังสีเดิมออก
  scene.background = null

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[0, -1, 0]} // ตำแหน่งดวงอาทิตย์อยู่ใต้ขอบฟ้า
        inclination={0}
        azimuth={0.25}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        rayleigh={2}
        turbidity={10}
      />
      <Stars
        radius={100} // ขนาดของท้องฟ้าที่มีดาว
        depth={50} // ความลึกของชั้นดาว สร้างความรู้สึก 3 มิติ
        count={5000} // จำนวนดาว
        factor={4} // ขนาดของดาว
        saturation={0} // ความอิ่มตัวของสี (0 = ขาวดำ, 1 = สีเต็ม)
        fade={true} // เฟดดาวตามระยะทาง
      />
    </>
  )
}

export default NightSky