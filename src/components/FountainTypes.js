// FountainTypes.js

import * as THREE from 'three';

// รูปแบบน้ำพุพื้นฐาน
export class BasicFountain {
  getParticlePosition(time, initialPosition) {
    const gravity = -9.8;
    const y = initialPosition.y + (10 * time) + (0.5 * gravity * time * time);
    return new THREE.Vector3(
      initialPosition.x,
      Math.max(y, 0), // ไม่ให้น้ำตกต่ำกว่าพื้น
      initialPosition.z
    );
  }
}

// น้ำพุทรงโดม
export class DomeFountain {
  getParticlePosition(time, initialPosition) {
    const gravity = -9.8;
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.sin(time * Math.PI) * 2; // รัศมีของโดม
    const x = initialPosition.x + Math.cos(angle) * radius;
    const z = initialPosition.z + Math.sin(angle) * radius;
    const y = initialPosition.y + (8 * time) + (0.5 * gravity * time * time);
    return new THREE.Vector3(x, Math.max(y, 0), z);
  }
}

// น้ำพุแบบหมุน
export class SpinningFountain {
  getParticlePosition(time, initialPosition) {
    const gravity = -9.8;
    const angle = time * 5; // ความเร็วในการหมุน
    const radius = 2;
    const x = initialPosition.x + Math.cos(angle) * radius;
    const z = initialPosition.z + Math.sin(angle) * radius;
    const y = initialPosition.y + (10 * time) + (0.5 * gravity * time * time);
    return new THREE.Vector3(x, Math.max(y, 0), z);
  }
}

// น้ำพุแบบคลื่น
export class WaveFountain {
  getParticlePosition(time, initialPosition) {
    const gravity = -9.8;
    const waveHeight = Math.sin(time * 5) * 2; // ความสูงของคลื่น
    const y = initialPosition.y + (8 * time) + waveHeight + (0.5 * gravity * time * time);
    return new THREE.Vector3(
      initialPosition.x,
      Math.max(y, 0),
      initialPosition.z
    );
  }
}

// น้ำพุแบบสุ่ม
export class RandomFountain {
  getParticlePosition(time, initialPosition) {
    const gravity = -9.8;
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      0,
      (Math.random() - 0.5) * 4
    );
    const y = initialPosition.y + (10 * time) + (0.5 * gravity * time * time);
    return new THREE.Vector3(
      initialPosition.x + randomOffset.x,
      Math.max(y, 0),
      initialPosition.z + randomOffset.z
    );
  }
}

// เพิ่มรูปแบบน้ำพุอื่นๆ ตามต้องการ...