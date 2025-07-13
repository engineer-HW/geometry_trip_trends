import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import { useState, useMemo } from "react";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";

export default function JapanMapFBX(props) {
  const fbx = useLoader(FBXLoader, "/日本地図ローポリ調整フリーズ前.fbx");
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // FBXから都道府県ごとのMeshを抽出し、樺太_sakhalinを除外
  const meshes = useMemo(() => {
    const arr = [];
    fbx.traverse((child) => {
      if (child.isMesh) {
        arr.push(child);
      }
    });
    // 樺太_sakhalinを除外
    return arr.filter((mesh) => mesh.name !== "樺太_sakhalin");
  }, [fbx]);

  return (
    <>
      <group scale={[0.017, 0.017, 0.017]} position={[-7, 0, -9]} {...props}>
        {meshes.map((mesh) => {
          let mat;
          if (mesh.material && typeof mesh.material.clone === "function") {
            mat = mesh.material.clone();
            if (mat.map) mat.map = null;
            mat.color = new THREE.Color(
              hovered === mesh.name ? "#ff6b6b" : "#3cb371"
            );
            mat.needsUpdate = true;
          } else {
            // fallback: 新規マテリアル
            mat = new THREE.MeshStandardMaterial({
              color: hovered === mesh.name ? "#ff6b6b" : "#3cb371",
            });
          }

          return (
            <mesh
              key={mesh.uuid}
              geometry={mesh.geometry}
              material={mat}
              //position={mesh.name.includes("沖縄") ? [300, 0, -800] : [0, 0, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(mesh.name);
                setMouse({ x: e.clientX, y: e.clientY });
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(null);
              }}
            >
              {hovered === mesh.name && (
                <Html center position={[0, 20, 0]}>
                  <div
                    style={{
                      background: "rgba(0,0,0,0.8)",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {mesh.name}
                  </div>
                </Html>
              )}
            </mesh>
          );
        })}
      </group>
    </>
  );
}
