import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import JapanMapFBX, { PREFECTURE_LIST } from "./JapanMapFBX";
import { useRef, useState } from "react";

function App() {
  const controlsRef = useRef();
  // 都道府県名の選択状態を追加
  const [selectedPref, setSelectedPref] = useState("");
  // 仮ピンデータ
  const [pins] = useState([
    { prefecture: "東京都", label: "仮ピン1" },
    { prefecture: "大阪府", label: "仮ピン2" },
  ]);
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
      {/* 右上に都道府県ラベルを固定表示（削除） */}
      {/* {selectedPref && (
        <div style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 20,
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "0.7em 1.5em",
          borderRadius: "8px",
          fontSize: "2rem",
          fontWeight: "bold",
          letterSpacing: "0.1em",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          {selectedPref}
        </div>
      )} */}
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

        {/* 選択した都道府県名と仮ピンデータを渡す */}
        <JapanMapFBX
          orbitControlsRef={controlsRef}
          selectedPref={selectedPref}
          pins={pins}
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
