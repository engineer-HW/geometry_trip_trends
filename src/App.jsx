import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import JapanMapFBX, { PREFECTURE_LIST } from "./JapanMapFBX";
import { useRef, useState } from "react";

function App() {
  const controlsRef = useRef();
  // 都道府県名の選択状態を追加
  const [selectedPref, setSelectedPref] = useState("");
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* 検索UI: セレクトボックス */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          background: "rgba(255,255,255,0.9)",
          padding: 8,
          borderRadius: 4,
        }}
      >
        <select
          value={selectedPref}
          onChange={(e) => setSelectedPref(e.target.value)}
          style={{ fontSize: "1.5rem", padding: "0.5em 1em", minWidth: 200 }}
        >
          <option value="" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            都道府県を選択
          </option>
          {PREFECTURE_LIST.map((pref) => (
            <option key={pref} value={pref} style={{ fontSize: "1.2rem" }}>
              {pref}
            </option>
          ))}
        </select>
      </div>
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

        {/* 選択した都道府県名を渡す */}
        <JapanMapFBX
          orbitControlsRef={controlsRef}
          selectedPref={selectedPref}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.0}
          maxDistance={22}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}

export default App;
