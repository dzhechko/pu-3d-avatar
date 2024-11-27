import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useSpeech } from "../hooks/useSpeech";
import * as THREE from "three";
import visemesMapping from "../constants/visemesMapping";

// Debug mode
const DEBUG = true;

// Priority list for mesh names that might contain morph targets
const MESH_PRIORITIES = [
  'Wolf3D_Head',
  'Wolf3D_Avatar',
  'Wolf3D_Face',
  'EyeLeft',
  'EyeRight',
  'Wolf3D_Teeth',
  'Face',
  'Head',
  'Avatar'
];

// Function to find the best mesh for lip sync
const findBestMeshForLipSync = (scene) => {
  let bestMesh = null;
  let bestPriority = -1;
  let allMeshesWithMorphs = [];

  debugLog('Starting mesh search...');

  scene.traverse((node) => {
    if (node.isMesh) {
      debugLog(`Found mesh: ${node.name}`, {
        isMesh: node.isMesh,
        hasMorphTargets: !!node.morphTargetDictionary,
        morphTargetCount: node.morphTargetDictionary ? Object.keys(node.morphTargetDictionary).length : 0
      });
      
      // Check if mesh has morph targets
      const hasMorphTargets = node.morphTargetDictionary && Object.keys(node.morphTargetDictionary).length > 0;
      if (hasMorphTargets) {
        const morphTargets = Object.keys(node.morphTargetDictionary);
        const hasVisemes = morphTargets.some(name => name.toLowerCase().includes('viseme'));
        
        allMeshesWithMorphs.push({
          name: node.name,
          morphTargets,
          hasVisemes
        });

        debugLog(`Found mesh with morph targets: ${node.name}`, {
          morphTargets,
          hasVisemes,
          morphTargetDictionary: node.morphTargetDictionary,
          morphTargetInfluences: node.morphTargetInfluences
        });

        // First try to find Wolf3D_Head or Wolf3D_Face specifically
        if (node.name === 'Wolf3D_Head' || node.name === 'Wolf3D_Face') {
          debugLog(`Found primary target mesh: ${node.name}`);
          bestMesh = node;
          return node; // Exit traversal
        }

        // Only consider meshes that have viseme morph targets
        if (hasVisemes) {
          // Find priority of this mesh
          const priority = MESH_PRIORITIES.findIndex(name => node.name.includes(name));
          if (priority !== -1 && (bestMesh === null || priority < bestPriority)) {
            bestPriority = priority;
            bestMesh = node;
            debugLog(`New best mesh: ${node.name} (priority: ${priority})`);
          }
        }
      }
    }
  });

  debugLog('All meshes with morph targets:', allMeshesWithMorphs);

  if (bestMesh) {
    debugLog(`Selected best mesh for lip sync: ${bestMesh.name}`, {
      morphTargets: Object.keys(bestMesh.morphTargetDictionary),
      morphTargetDictionary: bestMesh.morphTargetDictionary,
      morphTargetInfluences: bestMesh.morphTargetInfluences,
      priority: bestPriority
    });
  } else {
    debugLog('No suitable mesh found for lip sync');
  }

  return bestMesh;
};

// Animation name mapping
const ANIMATION_NAMES = {
  IDLE: ["Idle", "idle", "IDLE", "idle_loop", "Idle_Loop", "idle_standing", "Standing", "stand", "HappyIdle"],
  TALKING: ["TalkingOne", "talking", "TALKING", "talk", "Talk", "talking_1", "TalkingThree"],
};

// Default pose configuration
const DEFAULT_POSE = {
  position: [0, -1.75, 0],    // Adjusted to center the avatar
  rotation: [0, 0, 0],        // Straight forward
  scale: [1.15, 1.15, 1.15]   // Slightly adjusted scale
};

const debugLog = (...args) => {
  if (DEBUG) {
    console.log("[Avatar Debug]", ...args);
  }
};

// Function to inspect mesh for morph targets
const inspectMesh = (mesh) => {
  if (!mesh) return null;
  
  const info = {
    name: mesh.name,
    type: mesh.type,
    geometry: {
      type: mesh.geometry?.type,
      hasMorphTargets: !!mesh.geometry?.morphTargets,
      morphTargetCount: mesh.geometry?.morphTargets?.length,
      morphAttributes: mesh.geometry?.morphAttributes ? Object.keys(mesh.geometry.morphAttributes) : []
    },
    material: {
      type: mesh.material?.type,
      morphTargets: !!mesh.material?.morphTargets,
      morphNormals: !!mesh.material?.morphNormals
    },
    morphTargetInfluences: mesh.morphTargetInfluences ? [...mesh.morphTargetInfluences] : [],
    morphTargetDictionary: mesh.morphTargetDictionary ? {...mesh.morphTargetDictionary} : {}
  };
  
  // Log all available morph targets
  if (mesh.morphTargetDictionary) {
    debugLog(`Available morph targets for ${mesh.name}:`, 
      Object.keys(mesh.morphTargetDictionary).sort().join('\n')
    );
  }
  
  debugLog('Detailed Mesh Inspection:', info);
  return info;
};

// Helper function to find morph target by trying different naming conventions
const findMorphTarget = (morphTargetDictionary, visemeName) => {
  if (!morphTargetDictionary) return undefined;

  // Log all available targets for debugging
  debugLog('Looking for viseme:', visemeName);
  debugLog('Available targets:', Object.keys(morphTargetDictionary).sort());

  // Try exact match first
  if (morphTargetDictionary[visemeName] !== undefined) {
    return morphTargetDictionary[visemeName];
  }

  // Try common Ready Player Me morph target names
  const rpmMappings = {
    'viseme_aa': ['viseme_a', 'viseme_aa', 'A', 'aa'],
    'viseme_ih': ['viseme_i', 'viseme_ih', 'I', 'ih'],
    'viseme_oh': ['viseme_o', 'viseme_oh', 'O', 'oh'],
    'viseme_u': ['viseme_u', 'viseme_uh', 'U', 'uh'],
    'viseme_ff': ['viseme_f', 'viseme_ff', 'F', 'ff'],
    'viseme_th': ['viseme_th', 'TH', 'th'],
    'viseme_dd': ['viseme_d', 'viseme_dd', 'D', 'dd'],
    'viseme_kk': ['viseme_k', 'viseme_kk', 'K', 'kk'],
    'viseme_nn': ['viseme_n', 'viseme_nn', 'N', 'nn'],
    'viseme_sil': ['viseme_sil', 'sil', 'rest']
  };

  // Try RPM mappings
  for (const [key, variations] of Object.entries(rpmMappings)) {
    if (variations.includes(visemeName.toLowerCase())) {
      for (const targetName of variations) {
        if (morphTargetDictionary[targetName] !== undefined) {
          debugLog(`Found match for ${visemeName} -> ${targetName}`);
          return morphTargetDictionary[targetName];
        }
      }
    }
  }

  // Try without prefix
  const withoutPrefix = visemeName.replace(/^viseme_/i, '');
  if (morphTargetDictionary[withoutPrefix] !== undefined) {
    return morphTargetDictionary[withoutPrefix];
  }

  // Try with different prefixes
  const prefixes = ['viseme_', 'mouth_', 'morph_', ''];
  for (const prefix of prefixes) {
    const withPrefix = prefix + withoutPrefix;
    if (morphTargetDictionary[withPrefix] !== undefined) {
      return morphTargetDictionary[withPrefix];
    }
  }

  // Try common variations
  const variations = {
    'aa': ['open', 'ah', 'aah', 'mouth_open'],
    'ih': ['smile', 'ee', 'i', 'mouth_smile'],
    'oh': ['round', 'o', 'oo', 'mouth_round'],
    'uh': ['small', 'u', 'mouth_small'],
    'ff': ['teeth', 'f', 'v', 'mouth_teeth'],
    'th': ['tongue', 'th', 'mouth_th'],
    'sil': ['close', 'closed', 'rest', 'mouth_close']
  };

  const baseViseme = withoutPrefix.toLowerCase();
  if (variations[baseViseme]) {
    for (const variant of variations[baseViseme]) {
      if (morphTargetDictionary[variant] !== undefined) {
        debugLog(`Found variation match: ${visemeName} -> ${variant}`);
        return morphTargetDictionary[variant];
      }
      // Try with prefixes
      for (const prefix of prefixes) {
        const prefixedVariant = prefix + variant;
        if (morphTargetDictionary[prefixedVariant] !== undefined) {
          debugLog(`Found prefixed variation match: ${visemeName} -> ${prefixedVariant}`);
          return morphTargetDictionary[prefixedVariant];
        }
      }
    }
  }

  debugLog(`No match found for viseme: ${visemeName}`);
  return undefined;
};

// Function to find meshes for lip sync
const findMeshesForLipSync = (scene) => {
  let headMesh = null;
  let teethMesh = null;

  scene.traverse((node) => {
    if (node.isMesh) {
      debugLog(`Found mesh: ${node.name}`, {
        isMesh: node.isMesh,
        hasMorphTargets: !!node.morphTargetDictionary,
        morphTargetCount: node.morphTargetDictionary ? Object.keys(node.morphTargetDictionary).length : 0
      });
      
      if (node.morphTargetDictionary) {
        if (node.name.includes('Wolf3D_Head')) {
          headMesh = node;
          debugLog('Found head mesh:', node.name);
        } else if (node.name.includes('Wolf3D_Teeth')) {
          teethMesh = node;
          debugLog('Found teeth mesh:', node.name);
        }
      }
    }
  });

  return { headMesh, teethMesh };
};

export const Avatar = () => {
  const { message, onMessagePlayed } = useSpeech();
  const audio = useRef(new Audio());
  const groupRef = useRef();
  const mixer = useRef(null);
  const currentAction = useRef(null);
  const previousAction = useRef(null);
  const animationActions = useRef({});
  const [animationsLoaded, setAnimationsLoaded] = useState(false);
  const [headMesh, setHeadMesh] = useState(null);
  const [teethMesh, setTeethMesh] = useState(null);

  // Load both the model and animations
  const { scene } = useGLTF("/models/avatar.glb");
  const { animations } = useGLTF("/models/animations.glb");
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (scene) {
      debugLog('Scene loaded, inspecting meshes...');
      
      // Find meshes for lip sync
      const { headMesh: head, teethMesh: teeth } = findMeshesForLipSync(scene);
      if (head) {
        debugLog('Setting head mesh:', head.name);
        setHeadMesh(head);
      }
      if (teeth) {
        debugLog('Setting teeth mesh:', teeth.name);
        setTeethMesh(teeth);
      }

      // Setup scene
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false; // Prevent culling issues
          
          if (child.morphTargetDictionary) {
            debugLog(`Found mesh with morph targets: ${child.name}`, {
              morphTargets: Object.keys(child.morphTargetDictionary),
              morphTargetDictionary: child.morphTargetDictionary,
              morphTargetInfluences: child.morphTargetInfluences
            });
          }
        }
      });

      // Create animation mixer
      mixer.current = new THREE.AnimationMixer(scene);

      // Create animation actions with adjusted settings
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        animationActions.current[clip.name] = action;
        
        // Configure action for smoother transitions
        action.clampWhenFinished = true;
        action.loop = THREE.LoopRepeat;
        
        // Adjust idle animations to be nearly static
        if (ANIMATION_NAMES.IDLE.some(name => 
          clip.name.toLowerCase().includes(name.toLowerCase())
        )) {
          action.timeScale = 0.1; // Very slow movement
          action.setEffectiveWeight(0.3); // Very subtle movement
        }
        
        debugLog("Configured animation:", clip.name);
      });

      // Find and start idle animation
      const idleAnimation = findAnimationByType("IDLE");
      if (idleAnimation) {
        debugLog("Starting idle animation:", idleAnimation.name);
        currentAction.current = animationActions.current[idleAnimation.name];
        currentAction.current
          .reset()
          .setEffectiveTimeScale(0.1) // Very slow
          .setEffectiveWeight(0.3) // Very subtle
          .play();
      }

      setAnimationsLoaded(true);
    }
  }, [scene]);

  // Enhanced message debug
  useEffect(() => {
    if (message?.lipsync && headMesh) {
      debugLog('Processing lip sync with head mesh:', {
        meshName: headMesh.name,
        hasMorphTargets: !!headMesh.morphTargetDictionary,
        availableMorphTargets: headMesh.morphTargetDictionary ? 
          Object.keys(headMesh.morphTargetDictionary) : [],
        mouthCuesCount: message.lipsync.mouthCues.length,
        firstCue: message.lipsync.mouthCues[0],
        lastCue: message.lipsync.mouthCues[message.lipsync.mouthCues.length - 1]
      });
    }
  }, [message, headMesh]);

  // Handle message playback
  useEffect(() => {
    if (message) {
      debugLog("Received new message:", { 
        hasAudio: !!message.audio, 
        hasAnimation: !!message.animation,
        hasLipsync: !!message.lipsync
      });

      // Handle audio
      const base64Audio = message.audio;
      const audioDataURL = `data:audio/mp3;base64,${base64Audio}`;
      audio.current.src = audioDataURL;
      
      audio.current.onplay = () => {
        debugLog("Audio started playing");
      };

      audio.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });

      // Handle animation
      if (message.animation) {
        debugLog("Playing message animation:", message.animation);
        fadeToAction(message.animation);
      } else {
        debugLog("No animation specified, using default talking animation");
        const talkingAnimation = findAnimationByType("TALKING");
        if (talkingAnimation) {
          fadeToAction(talkingAnimation.name);
        }
      }

      // Handle message end
      audio.current.onended = () => {
        debugLog("Audio ended, returning to idle animation");
        const idleAnimation = findAnimationByType("IDLE");
        if (idleAnimation) {
          fadeToAction(idleAnimation.name);
        }
        onMessagePlayed();
      };
    }
  }, [message]);

  const findAnimationByType = (type) => {
    const possibleNames = ANIMATION_NAMES[type];
    const foundAnimation = animations.find(clip => 
      possibleNames.some(name => clip.name.toLowerCase().includes(name.toLowerCase()))
    );
    
    if (foundAnimation) {
      debugLog(`Found ${type} animation:`, foundAnimation.name);
    } else {
      debugLog(`No ${type} animation found among:`, animations.map(a => a.name));
    }
    
    return foundAnimation;
  };

  const fadeToAction = (actionName, duration = 0.5) => {
    if (!mixer.current) {
      debugLog("Mixer not initialized");
      return;
    }

    debugLog("Attempting to fade to action:", actionName);

    // Try to find the animation by name or type
    let targetAction = animationActions.current[actionName];
    if (!targetAction) {
      debugLog("Direct action not found, searching for talking animation");
      const talkingAnimation = findAnimationByType("TALKING");
      if (talkingAnimation) {
        targetAction = animationActions.current[talkingAnimation.name];
        debugLog("Using talking animation instead:", talkingAnimation.name);
      }
    }

    if (!targetAction) {
      console.warn(`No suitable animation found for ${actionName}`);
      return;
    }

    previousAction.current = currentAction.current;
    currentAction.current = targetAction;

    if (previousAction.current) {
      previousAction.current.fadeOut(duration);
    }

    // Configure animation based on type
    const isIdle = ANIMATION_NAMES.IDLE.some(name => 
      actionName.toLowerCase().includes(name.toLowerCase())
    );

    currentAction.current
      .reset()
      .setEffectiveTimeScale(isIdle ? 0.1 : 1) // Very slow for idle
      .setEffectiveWeight(isIdle ? 0.3 : 1) // Very subtle for idle
      .fadeIn(duration)
      .play();

    debugLog("Animation transition complete");
  };

  // Function to apply morph target to a mesh
  const applyMorphTarget = (mesh, viseme, influence) => {
    if (!mesh?.morphTargetDictionary || !mesh?.morphTargetInfluences) return;

    const visemeIndex = mesh.morphTargetDictionary[viseme];
    if (visemeIndex !== undefined) {
      mesh.morphTargetInfluences[visemeIndex] = influence;
    }
  };

  useFrame((state, delta) => {
    // Update animation mixer
    if (mixer.current) {
      mixer.current.update(delta);
    }

    // Handle lip sync
    if (message?.lipsync && headMesh?.morphTargetInfluences) {
      const { mouthCues } = message.lipsync;
      const audioTime = audio.current?.currentTime || 0;

      // Reset all viseme morph targets for head mesh
      if (headMesh?.morphTargetDictionary && headMesh?.morphTargetInfluences) {
        Object.keys(headMesh.morphTargetDictionary).forEach(key => {
          if (key.startsWith('viseme_')) {
            const index = headMesh.morphTargetDictionary[key];
            headMesh.morphTargetInfluences[index] = 0;
          }
        });
      }

      // Set default teeth position
      if (teethMesh?.morphTargetDictionary && teethMesh?.morphTargetInfluences) {
        // Reset all morphs first
        Object.keys(teethMesh.morphTargetDictionary).forEach(key => {
          const index = teethMesh.morphTargetDictionary[key];
          teethMesh.morphTargetInfluences[index] = 0;
        });

        // Apply base teeth position
        const teethMorphs = {
          'mouthClose': 0.8,        // Keep mouth mostly closed
          'mouthShrugLower': 0.5,   // Pull in lower lip/teeth
          'jawOpen': -0.3,          // Slightly close jaw
          'mouthPucker': 0.3,       // Pull teeth back
          'mouthRollLower': 0.3,    // Roll lower lip in
          'mouthPress': 0.2         // Press lips together
        };

        Object.entries(teethMorphs).forEach(([morphName, value]) => {
          const morphIndex = teethMesh.morphTargetDictionary[morphName];
          if (morphIndex !== undefined) {
            teethMesh.morphTargetInfluences[morphIndex] = value;
          }
        });
      }

      // Find current mouth cue
      const currentCue = mouthCues.find(
        (cue) => audioTime >= cue.start && audioTime <= cue.end
      );

      if (currentCue) {
        // Get the mapped viseme name
        const mappedViseme = visemesMapping[currentCue.value];
        
        if (DEBUG) {
          debugLog('Processing viseme:', {
            original: currentCue.value,
            mapped: mappedViseme,
            time: audioTime,
            start: currentCue.start,
            end: currentCue.end
          });
        }

        // Calculate influences
        const baseInfluence = 0.7;
        let influence = baseInfluence;
        if (mappedViseme === 'viseme_sil') {
          influence = 0.3;
        } else if (mappedViseme === 'viseme_aa' || mappedViseme === 'viseme_O') {
          influence = 0.8;
        }

        // Apply viseme to head mesh
        if (headMesh) {
          const visemeIndex = headMesh.morphTargetDictionary[mappedViseme];
          if (visemeIndex !== undefined) {
            headMesh.morphTargetInfluences[visemeIndex] = influence;

            // Apply jaw movement for head
            if (mappedViseme !== 'viseme_sil') {
              const jawMorphs = ['jawOpen', 'mouthOpen', 'mouth_open'];
              for (const jawMorph of jawMorphs) {
                const jawIndex = headMesh.morphTargetDictionary[jawMorph];
                if (jawIndex !== undefined) {
                  let jawInfluence = 0.2;
                  if (mappedViseme === 'viseme_aa' || mappedViseme === 'viseme_O') {
                    jawInfluence = 0.4;
                  } else if (mappedViseme === 'viseme_CH' || mappedViseme === 'viseme_DD') {
                    jawInfluence = 0.15;
                  }
                  headMesh.morphTargetInfluences[jawIndex] = jawInfluence;
                  break;
                }
              }
            }
          }
        }

        // Minimal teeth movement during speech
        if (teethMesh && mappedViseme !== 'viseme_sil') {
          const teethVisemeInfluence = influence * 0.1; // Very minimal viseme influence
          const visemeIndex = teethMesh.morphTargetDictionary[mappedViseme];
          if (visemeIndex !== undefined) {
            teethMesh.morphTargetInfluences[visemeIndex] = teethVisemeInfluence;
          }

          // Slight jaw movement for open sounds only
          if (mappedViseme === 'viseme_aa' || mappedViseme === 'viseme_O') {
            const jawIndex = teethMesh.morphTargetDictionary['jawOpen'];
            if (jawIndex !== undefined) {
              teethMesh.morphTargetInfluences[jawIndex] = -0.2; // Keep teeth down
            }
          }
        }
      }
    } else {
      // When not speaking, hide teeth completely
      if (teethMesh?.morphTargetDictionary && teethMesh?.morphTargetInfluences) {
        const hiddenTeethMorphs = {
          'mouthClose': 1.0,        // Completely close mouth
          'mouthShrugLower': 0.8,   // Pull in lower lip/teeth strongly
          'jawOpen': -0.5,          // Close jaw more
          'mouthPucker': 0.5,       // Pull teeth back more
          'mouthRollLower': 0.5,    // Roll lower lip in more
          'mouthPress': 0.4         // Press lips together more
        };

        Object.entries(hiddenTeethMorphs).forEach(([morphName, value]) => {
          const morphIndex = teethMesh.morphTargetDictionary[morphName];
          if (morphIndex !== undefined) {
            teethMesh.morphTargetInfluences[morphIndex] = value;
          }
        });
      }
    }
  });

  if (!animationsLoaded) {
    debugLog("Waiting for animations to load...");
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        position={DEFAULT_POSE.position}
        scale={DEFAULT_POSE.scale}
        rotation={DEFAULT_POSE.rotation}
      />
    </group>
  );
};
