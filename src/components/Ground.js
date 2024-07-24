import React, { useRef, useEffect, Suspense } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping } from 'three'
import { Plane } from '@react-three/drei'
import grassTextureFile from '../assets/textures/grass_texture.jpg'

const Ground = () => {
  const grassTexture = useLoader(TextureLoader, grassTextureFile)
  const meshRef = useRef()
  const { gl } = useThree()

  useEffect(() => {
    if (grassTexture) {
      grassTexture.wrapS = grassTexture.wrapT = RepeatWrapping
      grassTexture.repeat.set(10, 10)
      grassTexture.anisotropy = gl.capabilities.getMaxAnisotropy()
    }
  }, [grassTexture, gl])

  return (
    <Plane 
      args={[100, 100]}
      rotation-x={-Math.PI / 2}
      position={[0, -0.5, 0]}
      ref={meshRef}
      receiveShadow
    >
      <meshStandardMaterial 
        map={grassTexture}
        roughness={0.8}
        metalness={0.2}
      />
    </Plane>
  )
}

const GroundWithSuspense = () => (
  <Suspense fallback={<Plane args={[100, 100]} rotation-x={-Math.PI / 2} position={[0, -0.5, 0]}>
    <meshStandardMaterial color="green" />
  </Plane>}>
    <Ground />
  </Suspense>
)

export default GroundWithSuspense