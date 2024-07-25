import React,{ useRef,useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MIST_PARTICLE_COUNT = 1000;

const MistParticles = ({ position, audioData }) => {
  const particles = useRef();

  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(MIST_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(MIST_PARTICLE_COUNT);

    for (let i = 0; i < MIST_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 2;

      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * radius;

      sizes[i] = 0.05 + Math.random() * 0.05;
    }

    return [positions, sizes];
  }, []);

  useFrame((state) => {
    const { clock } = state;
    const time = clock.getElapsedTime();

    particles.current.rotation.y = time * 0.05;

    const positions = particles.current.geometry.attributes.position.array;
    for (let i = 0; i < MIST_PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3 + 1] = (Math.sin(time + i * 0.1) * 0.2) + 1 + Math.random() * 0.1;
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particles} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MIST_PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={MIST_PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default MistParticles;