import React, { useEffect, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Cylinder, SpotLight } from '@react-three/drei'
import * as THREE from 'three'
import Ground from './Ground'  // Import Ground component
import GardenElements from './GardenElements'  // Import the new component

// Vertex shader for water particles
const vertexShader = `
    attribute float size;
    attribute vec3 velocity;
    attribute float offset;
    uniform float time;
    uniform float bassIntensity;
    uniform float midIntensity;
    uniform float trebleIntensity;
    uniform float overallIntensity;
    varying float vOpacity;

    void main() {
      vec3 pos = position + velocity * (time + offset);
      
      // ปรับความสูงตามความถี่ต่างๆ
      pos.y *= bassIntensity * 0.5 + midIntensity * 0.3 + trebleIntensity * 0.2;
      pos.y -= 2.0 * (time + offset) * (time + offset) * overallIntensity;

      pos.x += sin(time * 2.0 + offset) * 0.1 * midIntensity;
      pos.z += cos(time * 2.0 + offset) * 0.1 * trebleIntensity;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z) * overallIntensity;
      gl_Position = projectionMatrix * mvPosition;

      float lifetime = 2.0;
      vOpacity = 1.0 - (time + offset) / lifetime;
      vOpacity = clamp(vOpacity, 0.0, 1.0);
    }
`

// Fragment shader for water particles
const fragmentShader = `
  uniform vec3 color;
  varying float vOpacity;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.4, dist) * vOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`

const PARTICLE_COUNT = 15000

// Component for creating water particles
const WaterParticles = ({ position, audioData }) => {
    const [positions, velocities, sizes, offsets] = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const offsets = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const radius = Math.random() * 0.5
      const angle = Math.random() * Math.PI * 2
      positions[i3] = Math.cos(angle) * radius
      positions[i3 + 1] = 0
      positions[i3 + 2] = Math.sin(angle) * radius

      const velocity = 2 + Math.random() * 2
      velocities[i3] = (Math.random() - 0.5) * 0.5
      velocities[i3 + 1] = velocity
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5

      sizes[i] = 0.1 + Math.random() * 0.3
      offsets[i] = Math.random() * 2
    }

    return [positions, velocities, sizes, offsets]
  }, [])

  const particles = useRef()
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(0x00aaff) },
    bassIntensity: { value: 1.0 },
    midIntensity: { value: 1.0 },
    trebleIntensity: { value: 1.0 },
    overallIntensity: { value: 1.0 }
  }), [])

  useFrame((state) => {
    const { clock } = state
    uniforms.time.value = clock.getElapsedTime() % 2
    
    if (audioData) {
        uniforms.bassIntensity.value = 1 + audioData[0] / 255 * 2;
        uniforms.midIntensity.value = 1 + audioData[1] / 255 * 2;
        uniforms.trebleIntensity.value = 1 + audioData[2] / 255 * 2;
        uniforms.overallIntensity.value = 1 + audioData[3] / 255 * 2;
      }
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
        <bufferAttribute
          attach="attributes-offset"
          count={PARTICLE_COUNT}
          array={offsets}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Component สำหรับสร้างน้ำพุ
const Fountain = ({ position, audioData }) => {
    return (
      <group position={position}>
        {/* ทรงกระบอกที่เป็นฐานน้ำพุ */}
        <Cylinder 
          args={[1, 1, 0.5, 32]} 
          position={[0, 0.25, 0]}
          castShadow  // เพิ่มการสร้างเงา
          receiveShadow  // เพิ่มการรับเงา
        >
          <meshStandardMaterial color="gray" />
        </Cylinder>
        <WaterParticles position={[0, 0.5, 0]} audioData={audioData} />
      </group>
    )
  }
  
 
// Component หลักสำหรับฉาก Dancing Fountain
export default function RealisticFountains({ audioData }) {
    const { scene, camera, gl } = useThree()
    
    useEffect(() => {
      // ตั้งค่าสีพื้นหลังของฉาก
      scene.background = new THREE.Color(0x87CEEB)
      
      // ตั้งค่าตำแหน่งกล้องเริ่มต้น
      camera.position.set(0, 5, 10)
      camera.lookAt(0, 0, 0)
  
      // เปิดใช้งานเงาสำหรับ renderer
      gl.shadowMap.enabled = true
      gl.shadowMap.type = THREE.PCFSoftShadowMap  // ใช้ soft shadow map เพื่อให้เงานุ่มนวลขึ้น
  
      // ตั้งค่าให้ทุก object ในฉากสามารถสร้างและรับเงาได้
      scene.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true
          object.receiveShadow = true
        }
      })
    }, [scene, camera, gl])
  
    return (
      <>
        <OrbitControls />
  
        {/* แสงแวดล้อมทั่วไป ให้แสงสว่างกับทุกวัตถุในฉาก */}
        <ambientLight intensity={0.3} />
  
        {/* แสงหลักจากด้านบน */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.5}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
  
        {/* SpotLight เพื่อเน้นแสงที่น้ำพุ */}
        <SpotLight
          position={[0, 10, 0]}
          angle={Math.PI / 6}
          penumbra={0.2}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#ffffff"
        />
  
        <Ground />
        <Fountain position={[0, 0, 0]} audioData={audioData} />
        <GardenElements />
      </>
    )
  }