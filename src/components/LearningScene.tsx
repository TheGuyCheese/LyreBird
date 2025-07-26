'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

// Map viseme phonemes to Oculus Viseme morph target names
const visemeMap: { [key: string]: string } = {
  'sil': 'viseme_sil',    // Silence
  'PP': 'viseme_PP',      // p, b, m
  'FF': 'viseme_FF',      // f, v
  'TH': 'viseme_TH',      // th
  'DD': 'viseme_DD',      // d, t, n, l
  'kk': 'viseme_kk',      // k, g
  'CH': 'viseme_CH',      // ch, j, sh, zh
  'SS': 'viseme_SS',      // s, z
  'nn': 'viseme_nn',      // n, ng
  'RR': 'viseme_RR',      // r
  'aa': 'viseme_aa',      // a (cat)
  'E': 'viseme_E',        // e (bed)
  'I': 'viseme_I',        // i (bit)
  'O': 'viseme_O',        // o (hot)
  'U': 'viseme_U',        // u (book)
};

// Define types for viseme data
type Viseme = {
  start: number;
  end: number;
  value: string;
};

// Helper component to handle the GLB model and its lip-sync animation
const Avatar = ({ audio, visemes }: { audio: HTMLAudioElement | null; visemes: Viseme[] | null }) => {
  const modelRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [headMesh, setHeadMesh] = useState<THREE.SkinnedMesh | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Load the GLB model
  const gltf = useLoader(GLTFLoader, '/avatars/male_avatar.glb');

  useEffect(() => {
    if (gltf && gltf.scene) {
      setModelLoaded(true);
      console.log('GLB Model loaded:', gltf.scene);
      
      // Find mesh with morph targets for lip-sync
      gltf.scene.traverse((child) => {
        
        // Find mesh with morph targets for lip-sync
        if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
          console.log('Found mesh with morph targets:', child.name);
          console.log('Available morph targets:', Object.keys(child.morphTargetDictionary));
          setHeadMesh(child);
        }
      });
    }
  }, [gltf]);

  // Track audio playing state
  useEffect(() => {
    if (!audio) return;

    const handlePlay = () => setIsAudioPlaying(true);
    const handlePause = () => setIsAudioPlaying(false);
    const handleEnded = () => setIsAudioPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audio]);

  // Animate the model with swaying and lip movement
  useFrame(({ clock }) => {
    if (!modelLoaded || !modelRef.current) return;

    const time = clock.getElapsedTime();

    // Swaying animation when not speaking
    if (!isAudioPlaying) {
      // Gentle swaying motion
      modelRef.current.rotation.y = Math.sin(time * 0.5) * 0.05; // Side to side sway
      modelRef.current.rotation.z = Math.cos(time * 0.3) * 0.02; // Slight tilt
      modelRef.current.position.x = Math.sin(time * 0.4) * 0.02; // Subtle side movement
      
      // Reset mouth to neutral when not speaking
      if (headMesh?.morphTargetDictionary && headMesh?.morphTargetInfluences) {
        Object.values(visemeMap).forEach(visemeName => {
          const index = headMesh.morphTargetDictionary![visemeName];
          if (index !== undefined && headMesh.morphTargetInfluences) {
            headMesh.morphTargetInfluences[index] = 0;
          }
        });
      }
    } else {
      // Reset position and rotation when speaking
      modelRef.current.rotation.y = 0;
      modelRef.current.rotation.z = 0;
      modelRef.current.position.x = 0;

      // Basic mouth movement during speech
      if (headMesh?.morphTargetDictionary && headMesh?.morphTargetInfluences) {
        // Reset all visemes first
        Object.values(visemeMap).forEach(visemeName => {
          const index = headMesh.morphTargetDictionary![visemeName];
          if (index !== undefined && headMesh.morphTargetInfluences) {
            headMesh.morphTargetInfluences[index] = 0;
          }
        });

        // If we have proper viseme data, use it
        if (audio && visemes) {
          const currentTime = audio.currentTime;
          const currentViseme = visemes.find(v => currentTime >= v.start && currentTime <= v.end);
          
          if (currentViseme) {
            const visemeName = visemeMap[currentViseme.value] || visemeMap['sil'];
            const index = headMesh.morphTargetDictionary[visemeName];
            if (index !== undefined && headMesh.morphTargetInfluences) {
              headMesh.morphTargetInfluences[index] = 0.8;
            }
          }
        } else {
          // Basic mouth movement without specific visemes
          const mouthMovement = Math.abs(Math.sin(time * 8)) * 0.6;
          const aaIndex = headMesh.morphTargetDictionary['viseme_aa'];
          const eIndex = headMesh.morphTargetDictionary['viseme_E'];
          
          if (aaIndex !== undefined && headMesh.morphTargetInfluences) {
            headMesh.morphTargetInfluences[aaIndex] = mouthMovement;
          }
          if (eIndex !== undefined && headMesh.morphTargetInfluences) {
            headMesh.morphTargetInfluences[eIndex] = mouthMovement * 0.5;
          }
        }
      }
    }
  });

  return gltf ? (
    <primitive 
      object={gltf.scene} 
      ref={modelRef} 
      scale={[3.5, 3.5, 3.5]} 
      position={[0, -5.7, 0]} // Same position as StaticAvatar
      rotation={[0, 0, 0]}
    />
  ) : null;
};

// Fallback component for when no audio/visemes are available
const StaticAvatar = () => {
  const modelRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, '/avatars/male_avatar.glb');
  
  // Add swaying animation for static avatar
  useFrame(({ clock }) => {
    if (!modelRef.current) return;

    const time = clock.getElapsedTime();
    
    // Gentle swaying motion
    modelRef.current.rotation.y = Math.sin(time * 0.5) * 0.05; // Side to side sway
    modelRef.current.rotation.z = Math.cos(time * 0.3) * 0.02; // Slight tilt
    modelRef.current.position.x = Math.sin(time * 0.4) * 0.02; // Subtle side movement
  });
  
  return gltf ? (
    <primitive 
      object={gltf.scene} 
      ref={modelRef}
      scale={[3.5, 3.5, 3.5]} 
      position={[0, -5.7, 0]} // moved down
      rotation={[0, 0, 0]}
    />
  ) : null;
};

// Main Scene Component
interface LearningSceneProps {
  audio?: HTMLAudioElement | null;
  visemes?: Viseme[] | null;
}

export const LearningScene: React.FC<LearningSceneProps> = ({ audio, visemes }) => {
  return (
    <Canvas 
      camera={{ 
        position: [0, -0.1, 2], // Front-facing at head level, looking straight at the avatar
        fov: 50, // Very narrow field of view for tight passport crop
        near: 0.3,
        far: 75
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} />
      <pointLight position={[-1, 2, 1]} intensity={0.6} />
      <spotLight position={[0, 3, 1.5]} intensity={0.8} angle={0.5} penumbra={0.2} />
      
      {audio && visemes ? (
        <Avatar audio={audio} visemes={visemes} />
      ) : (
        <StaticAvatar />
      )}
      

    </Canvas>
  );
};

export default LearningScene; 