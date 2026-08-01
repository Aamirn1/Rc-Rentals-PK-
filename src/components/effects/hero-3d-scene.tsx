"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sparkles } from "@react-three/drei";
import { Suspense, useRef } from "react";
import type { Mesh, Group } from "three";

/** A stylised rotating alloy wheel — metallic, glossy, premium. */
function AlloyWheel() {
  const group = useRef<Group>(null);
  const rim = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.x += delta * 0.25;
      group.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={group} rotation={[0.4, 0.2, 0]}>
      {/* Tyre */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.6, 0.55, 32, 80]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Rim disc */}
      <mesh ref={rim}>
        <cylinderGeometry args={[1.55, 1.55, 0.35, 64]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial
          color="#f5b042"
          metalness={1}
          roughness={0.15}
          emissive="#7a4a00"
          emissiveIntensity={0.25}
        />
      </mesh>
      {/* Spokes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} rotation={[0, 0, (i / 6) * Math.PI * 2]} position={[0, 0, 0.18]}>
          <boxGeometry args={[0.28, 2.7, 0.18]} />
          <meshStandardMaterial color="#ffd98a" metalness={1} roughness={0.18} />
        </mesh>
      ))}
      {/* Hub cap */}
      <mesh position={[0, 0, 0.22]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <meshStandardMaterial color="#0a0a12" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.38]}>
        <cylinderGeometry args={[0.16, 0.16, 0.2, 24]} />
        <meshStandardMaterial
          color="#34d399"
          metalness={0.8}
          roughness={0.2}
          emissive="#10b981"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

function FloatingCube({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.5;
      ref.current.rotation.y += delta * 0.7;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} flatShading />
      </mesh>
    </Float>
  );
}

export function Hero3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#fff4d6" />
        <pointLight position={[-4, -2, 3]} intensity={2} color="#f5b042" />
        <pointLight position={[4, 3, -2]} intensity={1.5} color="#34d399" />
        <AlloyWheel />
        <FloatingCube position={[2.6, 1.4, -1]} color="#f5b042" />
        <FloatingCube position={[-2.8, -1.2, -0.5]} color="#34d399" />
        <FloatingCube position={[2.2, -1.6, 0.5]} color="#ffd98a" />
        <Sparkles count={40} scale={8} size={2} speed={0.4} color="#f5b042" opacity={0.6} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
