import { Environment, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Avatar } from "./Avatar";

export const Experience = () => {
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0, 0, 3]} 
        fov={50}
        near={0.1}
        far={100}
      />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping={true}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 8}
        maxAzimuthAngle={Math.PI / 8}
      />
      <Environment preset="city" />
      <ambientLight intensity={1} />
      <directionalLight
        position={[0, 2, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-5, 2, -5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Avatar />
    </>
  );
}; 