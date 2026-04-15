'use client';

/**
 * CosmicOrb — 3D宇宙球体
 *
 * 基于 AI_Animation 的3D旋转效果
 * 使用Three.js + React Three Fiber
 */

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbConfig {
  color?: string;
  wireframe?: boolean;
  rotateSpeed?: number;
  glowIntensity?: number;
}

function RotatingOrb({ config }: { config: OrbConfig }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const {
    color = '#A782FF',
    wireframe = true,
    rotateSpeed = 0.005,
    glowIntensity = 0.5
  } = config;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotateSpeed;
      meshRef.current.rotation.y += rotateSpeed * 0.8;

      // Gentle floating motion
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <icosahedronGeometry args={[1.5, 2]} />
      <meshPhongMaterial
        color={hovered ? '#EC4899' : color}
        transparent
        opacity={0.7}
        wireframe={wireframe}
        emissive={hovered ? '#EC4899' : color}
        emissiveIntensity={hovered ? 0.8 : glowIntensity}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#A782FF" transparent opacity={0.6} />
    </points>
  );
}

function Rings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ring1.current) ring1.current.rotation.z += 0.01;
    if (ring2.current) ring2.current.rotation.x += 0.015;
    if (ring3.current) ring3.current.rotation.y += 0.02;
  });

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2} rotation={[0, 0, 0]}>
        <torusGeometry args={[3, 0.015, 16, 100]} />
        <meshBasicMaterial color="#A782FF" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[3.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#EC4899" transparent opacity={0.2} />
      </mesh>
    </>
  );
}

export default function CosmicOrb({
  color = '#A782FF',
  wireframe = true,
  rotateSpeed = 0.005,
  glowIntensity = 0.5,
  width = 600,
  height = 400,
  className = ''
}: OrbConfig & { width?: number; height?: number; className?: string }) {
  return (
    <div className={`cosmic-orb ${className}`} style={{ width, height }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} color={color} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} color="#EC4899" intensity={0.5} />

        <RotatingOrb
          config={{ color, wireframe, rotateSpeed, glowIntensity }}
        />

        <FloatingParticles />
        <Rings />
      </Canvas>

      <style jsx>{`
        .cosmic-orb {
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(180deg, #030014 0%, #0a0a1e 100%);
        }
      `}</style>
    </div>
  );
}