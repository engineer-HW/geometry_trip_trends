import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import JapanMapFBX from "./JapanMapFBX";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{
          position: [0, 20, 0],
          fov: 70,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "#00aaff" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        <JapanMapFBX />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={25}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}

export default App;
