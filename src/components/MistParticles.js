import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MistParticles = ({ count = 1000, color = '#ffffff' }) => {
  const particles = useRef()

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = Math.random() * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      sizes[i] = Math.random() * 0.1 + 0.05
    }

    return [positions, sizes]
  }, [count])

  useFrame((state) => {
    if (particles.current && particles.current.geometry.attributes.position) {
      const { clock } = state
      const time = clock.getElapsedTime()
      const positionArray = particles.current.geometry.attributes.position.array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        positionArray[i3 + 1] = (Math.sin(time + positionArray[i3] * 0.1) * 0.2) + positions[i3 + 1]
      }
      particles.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attachObject={['attributes', 'size']}
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default MistParticles