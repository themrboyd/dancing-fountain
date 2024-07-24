import React, { useEffect, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Cylinder, SpotLight } from '@react-three/drei'
import * as THREE from 'three'
import Ground from './Ground'  // Import Ground component

import { EffectComposer, Bloom, DepthOfField, SMAA, ToneMapping } from '@react-three/postprocessing'

import NightSky from './NightSky'
import MistParticles from './MistParticles'

// Vertex shader for water particles
const vertexShader = `
    uniform float time;
    uniform float bassIntensity;
    uniform float lowMidIntensity;
    uniform float highMidIntensity;
    uniform float trebleIntensity;
    attribute float size;
    attribute vec3 velocity;
    attribute float offset;
    varying float vOpacity;
    varying vec3 vPosition;
    varying vec3 vNormal;

    // เพิ่มฟังก์ชัน Perlin noise (ตัวอย่างอย่างง่าย)
    float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
    }

    void main() {
        vec3 pos = position + velocity * (time + offset);
        
        // เพิ่มการรบกวนแบบ Perlin noise
        float noiseValue = noise(pos * 0.1 + time * 0.1);
        
        // ปรับปรุงการคำนวณตำแหน่งโดยใช้ความถี่ต่างๆ
        pos.y *= bassIntensity * 0.4 + lowMidIntensity * 0.3 + highMidIntensity * 0.2 + trebleIntensity * 0.1;
        pos.y += noiseValue * (bassIntensity + lowMidIntensity) * 0.5;
        pos.y -= 2.0 * (time + offset) * (time + offset);

        // เพิ่มการเคลื่อนไหวในแนวนอนตามความถี่
        pos.x += sin(time * 2.0 + offset) * 0.1 * lowMidIntensity;
        pos.z += cos(time * 2.0 + offset) * 0.1 * highMidIntensity;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (bassIntensity + trebleIntensity) * 0.5;
        gl_Position = projectionMatrix * mvPosition;

        float lifetime = 2.0;
        vOpacity = smoothstep(0.0, 0.2, 1.0 - (time + offset) / lifetime);
        vPosition = pos;
        vNormal = normalize(pos - position);
    }
`

// ปรับปรุง Fragment shader
const fragmentShader = `
    uniform vec3 color;
    uniform float trebleIntensity;
    varying float vOpacity;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.4, dist) * vOpacity;

        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

        // ปรับสีตามความถี่สูง
        vec3 waterColor = mix(color, vec3(0.8, 0.9, 1.0), vPosition.y * 0.1 + fresnel * 0.5 + trebleIntensity * 0.3);
        
        float highlight = pow(max(dot(viewDir, reflect(-viewDir, vNormal)), 0.0), 32.0);
        waterColor += vec3(1.0) * highlight * 0.5 * (1.0 + trebleIntensity);

        gl_FragColor = vec4(waterColor, alpha);
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
    lowMidIntensity: { value: 1.0 },
    highMidIntensity: { value: 1.0 },
    trebleIntensity: { value: 1.0 }
  }), [])

  useFrame((state) => {
    const { clock } = state
    uniforms.time.value = clock.getElapsedTime() % 2
    
    if (audioData) {
        uniforms.bassIntensity.value = 1 + audioData[0] / 255 * 2;
        uniforms.lowMidIntensity.value = 1 + audioData[1] / 255 * 2;
        uniforms.highMidIntensity.value = 1 + audioData[2] / 255 * 2;
        uniforms.trebleIntensity.value = 1 + audioData[3] / 255 * 2;
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

const AudioResponsiveLight = ({ audioData }) => {
    const light = useRef()
    
    useFrame(() => {
      if (audioData && light.current) {
        const intensity = 0.5 + audioData[3] / 255 * 1.5 // ใช้ overall intensity
        light.current.intensity = intensity
      }
    })
  
    return <pointLight ref={light} position={[0, 5, 0]} color="#00ffff" />
  }

  const NightLighting = ({ audioData }) => {
    const spotLightRef = useRef();
  
    useFrame(() => {
      if (audioData && spotLightRef.current) {
        // ปรับความเข้มของ SpotLight ตาม audioData
        const intensity = 0.5 + audioData[3] / 255 * 1.5;
        spotLightRef.current.intensity = intensity;
      }
    });
  
    return (
      <>
        {/* ใช้ ambientLight เพียงเล็กน้อยเพื่อให้เห็นรายละเอียดของฉาก */}
        <ambientLight intensity={1.2} color="#b6cff7" />
        
        {/* SpotLight หลักสำหรับส่องน้ำพุ */}
        <SpotLight
          ref={spotLightRef}
          position={[0, 10, 0]}
          angle={Math.PI / 6}
          penumbra={0.2}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#00ffff" // สีฟ้าอมเขียวเพื่อให้เข้ากับบรรยากาศกลางคืน
          distance={20} // จำกัดระยะของแสงเพื่อให้เกิดความรู้สึกเป็นจุดสนใจ
          visible={false}
        />

         {/* เพิ่ม directionalLight เพื่อจำลองแสงจันทร์ */}
        <directionalLight
            position={[-10, 10, -10]}
            intensity={0.1}
            color="#b6cff7"
        />
        
        {/* เพิ่มไฟประดับรอบน้ำพุ */}
        <pointLight position={[2, 0.5, 2]} intensity={0.2} color="#ff9900" distance={5} />
        <pointLight position={[-2, 0.5, -2]} intensity={0.2} color="#ff9900" distance={5} />
      </>
    );
  };

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
  
  const CameraControl = ({ initialPosition = [0, 10, 20] }) => {
    const { camera } = useThree()
    const controlsRef = useRef()
  
    useFrame(() => {
      if (controlsRef.current) {
        controlsRef.current.update()
      }
    })
  
    return (
      <OrbitControls
        ref={controlsRef}
        args={[camera]}
        enableZoom={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
    )
  }
 
// Component หลักสำหรับฉาก Dancing Fountain
export default function RealisticFountains({ audioData }) {
    const { scene, camera, gl } = useThree()
    
    useEffect(() => {
       // ตั้งค่าฉากและกล้อง
       scene.background = new THREE.Color(0x000000)
       camera.position.set(0, 15, 25)  // ปรับตำแหน่งกล้องให้มองเห็นน้ำพุทั้งหมด
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
  
    // กำหนดตำแหน่งของน้ำพุ 5 อัน
    const fountainPositions = [
        [0, 0, 0],       // ตรงกลาง
        [-6, 0, -6],     // ซ้ายบน
        [6, 0, -6],      // ขวาบน
        [-6, 0, 6],      // ซ้ายล่าง
        [6, 0, 6]        // ขวาล่าง
    ]
    return (
        <>
        <MistParticles count={2000} color="#a0e0ff" />
        <NightSky />
        <NightLighting audioData={audioData} />
        <CameraControl initialPosition={[0, 10, 20]} />
          <AudioResponsiveLight audioData={audioData} />
          <OrbitControls
           minDistance={5}  // กำหนดระยะใกล้สุดที่สามารถ zoom เข้าได้
           maxDistance={50}  // กำหนดระยะไกลสุดที่สามารถ zoom ออกได้
           maxPolarAngle={Math.PI / 2}  // จำกัดมุมในแนวดิ่งเพื่อป้องกันการมองทะลุพื้น
          />
          <Ground />
          {/* สร้างน้ำพุ 5 อัน */}
          {fountainPositions.map((position, index) => (
                <Fountain 
                    key={index} 
                    position={position} 
                    audioData={audioData} 
                />
            ))}
           <EffectComposer multisampling={8}>
                <Bloom 
                    intensity={0.6} 
                    luminanceThreshold={0.2} 
                    luminanceSmoothing={0.9} 
                    height={300} 
                />
                <DepthOfField 
                    focusDistance={0.01} 
                    focalLength={0.2} 
                    bokehScale={3} 
                    height={480} 
                />
                <SMAA />
                <ToneMapping
                    adaptive={true}
                    averageLuminance={0.01}
                    minLuminance={0.001}
                    maxLuminance={1}
                    middleGrey={0.4}
                    exposure={1.2}
                />
            </EffectComposer>
        </>
      )
  }