"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { Mesh } from "three";

function Ornament() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.22;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.7}>
      <mesh ref={ref} position={[0.95, 0.95, 0]}>
        <torusKnotGeometry args={[0.12, 0.028, 72, 12]} />
        <meshStandardMaterial color="#c79a4a" metalness={0.78} roughness={0.26} />
      </mesh>
    </Float>
  );
}

export function HeroThree() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 1.4]}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[2, 3, 4]} intensity={3} color="#f8d7a5" />
        <Ornament />
      </Canvas>
    </div>
  );
}
