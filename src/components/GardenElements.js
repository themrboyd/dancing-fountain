import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { Plane, Box } from '@react-three/drei'

// ฟังก์ชันสำหรับสร้าง texture แบบโปรแกรม
const createTexture = (color1, color2, size = 256) => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const context = canvas.getContext('2d')
  
  context.fillStyle = color1
  context.fillRect(0, 0, size, size)
  
  context.fillStyle = color2
  context.fillRect(0, 0, size / 2, size / 2)
  context.fillRect(size / 2, size / 2, size / 2, size / 2)
  
  return new THREE.CanvasTexture(canvas)
}

const Tree = ({ position }) => {
  const treeTexture = useMemo(() => createTexture('#8B4513', '#006400'), [])
  return (
    <group position={position}>
      <Box args={[0.5, 4, 0.5]} position={[0, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={treeTexture} />
      </Box>
      <Plane args={[3, 3]} position={[0, 4, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial map={treeTexture} transparent opacity={0.9} side={2} />
      </Plane>
    </group>
  )
}

const Flower = ({ position }) => {
  // สร้าง texture สำหรับดอกไม้ (สีเหลืองและสีแดง)
  const flowerTexture = useMemo(() => createTexture('#FFFF00', '#FF0000', 64), [])
  
  return (
    <Plane args={[0.5, 0.5]} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial map={flowerTexture} transparent side={2} />
    </Plane>
  )
}

const Bench = ({ position, rotation }) => {
  // สร้าง texture สำหรับม้านั่ง (สีน้ำตาลอ่อนและสีน้ำตาลเข้ม)
  const benchTexture = useMemo(() => createTexture('#DEB887', '#8B4513'), [])
  
  return (
    <group position={position} rotation={rotation}>
      <Box args={[2, 0.1, 0.5]} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={benchTexture} />
      </Box>
      <Box args={[0.1, 0.5, 0.5]} position={[-0.95, 0.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={benchTexture} />
      </Box>
      <Box args={[0.1, 0.5, 0.5]} position={[0.95, 0.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={benchTexture} />
      </Box>
    </group>
  )
}

const GardenElements = () => {
  return (
    <>
      <Tree position={[-5, 0, -5]} />
      <Tree position={[5, 0, -5]} />
      <Tree position={[-5, 0, 5]} />
      <Tree position={[5, 0, 5]} />
      
      <Flower position={[-2, 0.01, -2]} />
      <Flower position={[-1.5, 0.01, -2.5]} />
      <Flower position={[-2.5, 0.01, -1.5]} />
      
      <Flower position={[2, 0.01, 2]} />
      <Flower position={[1.5, 0.01, 2.5]} />
      <Flower position={[2.5, 0.01, 1.5]} />
      
      <Bench position={[0, 0, 5]} />
      <Bench position={[0, 0, -5]} rotation={[0, Math.PI, 0]} />
    </>
  )
}

export default GardenElements