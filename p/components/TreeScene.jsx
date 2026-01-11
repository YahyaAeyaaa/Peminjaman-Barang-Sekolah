'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import { Suspense } from 'react';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Box di tengah */}
      <Box position={[0, 0, 0]} args={[2, 2, 2]}>
        <meshStandardMaterial color="orange" />
      </Box>
      
      {/* Sphere di samping */}
      <Sphere position={[3, 0, 0]} args={[1, 32, 32]}>
        <meshStandardMaterial color="hotpink" />
      </Sphere>
      
      {/* OrbitControls untuk interaksi */}
      <OrbitControls />
    </>
  );
}

export default function TreeScene() {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}

