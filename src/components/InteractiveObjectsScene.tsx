'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Define 3D objects for learning
const objects = [
  { id: 'apple', name: 'Apple', position: [-2, 0, 0], color: '#ff4444', shape: 'sphere' },
  { id: 'car', name: 'Car', position: [0, 0, 0], color: '#4444ff', shape: 'box' },
  { id: 'house', name: 'House', position: [2, 0, 0], color: '#44ff44', shape: 'pyramid' },
  { id: 'coffee', name: 'Coffee', position: [-1, -1.5, 0], color: '#8B4513', shape: 'cylinder' },
  { id: 'shirt', name: 'Shirt', position: [1, -1.5, 0], color: '#ff44ff', shape: 'box' }
];

// Interactive object component
const InteractiveObject = ({ 
  object, 
  onObjectClick, 
  isSelected 
}: { 
  object: any; 
  onObjectClick: (obj: any) => void;
  isSelected: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Gentle floating animation
    meshRef.current.position.y = object.position[1] + Math.sin(clock.elapsedTime + object.position[0]) * 0.1;
    
    // Rotation animation
    meshRef.current.rotation.y = clock.elapsedTime * 0.5;
    
    // Scale animation when hovered or selected
    const targetScale = hovered || isSelected ? 1.2 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const renderGeometry = () => {
    switch (object.shape) {
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />;
      case 'pyramid':
        return <coneGeometry args={[0.5, 0.8, 4]} />;
      default:
        return <boxGeometry args={[0.8, 0.6, 0.4]} />;
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={object.position}
        onClick={() => onObjectClick(object)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {renderGeometry()}
        <meshStandardMaterial 
          color={object.color} 
          emissive={hovered || isSelected ? object.color : '#000000'}
          emissiveIntensity={hovered || isSelected ? 0.2 : 0}
        />
      </mesh>
      
      {/* Object label */}
      <Text
        position={[object.position[0], object.position[1] + 1, object.position[2]]}
        fontSize={0.3}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        {object.name}
      </Text>
    </group>
  );
};

// Main Interactive Objects Scene Component
interface InteractiveObjectsSceneProps {
  selectedLanguage?: string;
  onObjectClick?: (obj: any) => void;
  selectedObject?: any;
}

export const InteractiveObjectsScene: React.FC<InteractiveObjectsSceneProps> = ({ 
  selectedLanguage = 'es', 
  onObjectClick,
  selectedObject 
}) => {
  return (
    <Canvas 
      camera={{ 
        position: [0, 2, 5],
        fov: 60,
        near: 0.1,
        far: 100
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.5} />
      
      {objects.map((object) => (
        <InteractiveObject
          key={object.id}
          object={object}
          onObjectClick={onObjectClick || (() => {})}
          isSelected={selectedObject?.id === object.id}
        />
      ))}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
      </mesh>
    </Canvas>
  );
};

export default InteractiveObjectsScene; 