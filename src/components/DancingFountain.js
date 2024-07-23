import React, { useEffect, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import Ground from './Ground'  // Import Ground component

// Vertex shader for water particles
const vertexShader = `
  attribute float size;
  attribute vec3 velocity;
  uniform float time;
  varying float vLifespan;

  void main() {
    // Calculate new position based on velocity and time
    vec3 pos = position + velocity * time;
    pos.y -= 2.0 * time * time; // Apply gravity effect
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    // Adjust point size based on distance from camera
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vLifespan = 1.0 - (time / 2.0); // Calculate lifespan (2 seconds total)
  }
`

// Fragment shader for water particles
const fragmentShader = `
  uniform vec3 color;
  varying float vLifespan;

  void main() {
    if (vLifespan <= 0.0) discard; // Discard particles that have exceeded their lifespan
    gl_FragColor = vec4(color, vLifespan);
  }
`

const PARTICLE_COUNT = 5000

// Component for creating water particles
const WaterParticles = ({ position }) => {
  // Create particle attributes
  const [positions, velocities, sizes] = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      // Set random initial positions
      positions[i3] = (Math.random() - 0.5) * 0.5
      positions[i3 + 1] = 0
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5

      // Set random velocities
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 2
      velocities[i3] = Math.cos(angle) * speed * 0.2
      velocities[i3 + 1] = 3 + Math.random() * 2 // Initial upward velocity
      velocities[i3 + 2] = Math.sin(angle) * speed * 0.2

      // Set random sizes
      sizes[i] = 0.1 + Math.random() * 0.3
    }

    return [positions, velocities, sizes]
  }, [])

  const particles = useRef()
  // Create uniforms for shader
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(0x00aaff) }
  }), [])

  // Update particle system on each frame
  useFrame((state) => {
    const { clock } = state
    uniforms.time.value = clock.getElapsedTime() % 2 // Reset every 2 seconds
    particles.current.material.uniforms.time.value = uniforms.time.value
  })

  return (
    <points ref={particles} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-velocity"
          count={PARTICLE_COUNT}
          array={velocities}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  )
}

// Component for creating a fountain
const Fountain = ({ position }) => {
  return (
    <group position={position}>
      <Cylinder args={[1, 1, 0.5, 32]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="gray" />
      </Cylinder>
      <WaterParticles position={[0, 0.5, 0]} />
    </group>
  )
}

// Main component for the realistic fountains scene
export default function RealisticFountains() {
  console.log('Rendering RealisticFountains')
  
  const { scene, camera } = useThree()
  
  useEffect(() => {
    console.log('Scene:', scene)
    console.log('Camera:', camera)
    
    // Set sky color
    scene.background = new THREE.Color(0x87CEEB)
    
    // Set initial camera position and look at center
    camera.position.set(0, 5, 10)
    camera.lookAt(0, 0, 0)
  }, [scene, camera])

  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Ground />
      <Fountain position={[0, 0, 0]} />
      <axesHelper args={[5]} />
    </>
  )
}