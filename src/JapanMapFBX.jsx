import { useLoader, useThree } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import { useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";

// 地方と都道府県の対応関係
const regionToPrefectures = {
  北海道: ["北海道"],
  東北地方: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  関東地方: [
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
  ],
  中部地方: [
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
  ],
  近畿地方: [
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
  ],
  中国地方: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  四国地方: ["徳島県", "香川県", "愛媛県", "高知県"],
  "九州地方・沖縄": [
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ],
};

// 都道府県の位置情報（おおよその中心座標）
const prefecturePositions = {
  北海道: [0, 0, 0],
  青森県: [-2, 0, -1],
  岩手県: [-1.5, 0, -1.5],
  宮城県: [-1, 0, -2],
  秋田県: [-2, 0, -2],
  山形県: [-1.5, 0, -2.5],
  福島県: [-0.5, 0, -2.5],
  茨城県: [0.5, 0, -2],
  栃木県: [0, 0, -2.5],
  群馬県: [-0.5, 0, -3],
  埼玉県: [0.5, 0, -3],
  千葉県: [1, 0, -2.5],
  東京都: [0.5, 0, -3.5],
  神奈川県: [0, 0, -4],
  新潟県: [-1, 0, -3],
  富山県: [-0.5, 0, -4],
  石川県: [-1, 0, -4.5],
  福井県: [-1.5, 0, -4.5],
  山梨県: [0, 0, -4.5],
  長野県: [-0.5, 0, -5],
  岐阜県: [-1, 0, -5.5],
  静岡県: [0.5, 0, -5],
  愛知県: [-0.5, 0, -5.5],
  三重県: [-1, 0, -6],
  滋賀県: [-1.5, 0, -6],
  京都府: [-2, 0, -6.5],
  大阪府: [-2.5, 0, -6.5],
  兵庫県: [-3, 0, -6],
  奈良県: [-2.5, 0, -7],
  和歌山県: [-2.5, 0, -7.5],
  鳥取県: [-3.5, 0, -6.5],
  島根県: [-4, 0, -6.5],
  岡山県: [-3.5, 0, -7],
  広島県: [-4, 0, -7],
  山口県: [-4.5, 0, -7],
  徳島県: [-2.5, 0, -8],
  香川県: [-3, 0, -8],
  愛媛県: [-3.5, 0, -8],
  高知県: [-2.5, 0, -8.5],
  福岡県: [-4.5, 0, -8],
  佐賀県: [-4, 0, -8.5],
  長崎県: [-5, 0, -8.5],
  熊本県: [-4.5, 0, -9],
  大分県: [-3.5, 0, -9],
  宮崎県: [-4, 0, -9.5],
  鹿児島県: [-4.5, 0, -10],
  沖縄県: [-3, 0, -12],
};

// mesh.nameから都道府県名だけを抽出する関数
function extractPrefName(meshName) {
  const m = meshName.match(/^[0-9]+_([^_]+)_/);
  return m ? m[1] : meshName;
}

export default function JapanMapFBX(props) {
  const fbx = useLoader(FBXLoader, "/日本地図ローポリ調整フリーズ前.fbx");
  const [hovered, setHovered] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { camera } = useThree();

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

  // mesh.name一覧をデバッグ出力
  useEffect(() => {
    console.log(
      "FBX都道府県名一覧:",
      meshes.map((mesh) => mesh.name)
    );
  }, [meshes]);

  // 各meshの中心座標を自動計算
  const meshCenters = useMemo(() => {
    const centers = {};
    meshes.forEach((mesh) => {
      const box = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      centers[mesh.uuid] = center;
    });
    return centers;
  }, [meshes]);

  // meshクリック時にカメラ移動（自動中心座標）
  const moveCameraToMeshCenter = (mesh) => {
    const center = meshCenters[mesh.uuid];
    if (center) {
      // グループのスケール・位置を考慮
      const scale = 0.017;
      const offset = new THREE.Vector3(-7, 0, -9);
      const scaled = center.clone().multiplyScalar(scale).add(offset);
      // 真上から見下ろす: x, y+距離, z
      camera.position.set(scaled.x, scaled.y + 6, scaled.z);
      camera.up.set(0, 1, 0); // デフォルトの上方向
      camera.lookAt(scaled.x, scaled.y, scaled.z);
    }
  };

  return (
    <>
      <group scale={[0.017, 0.017, 0.017]} position={[-7, 0, -9]} {...props}>
        {Object.entries(regionToPrefectures).map(([region, prefectures]) => (
          <group key={region} name={region}>
            {meshes
              .filter((mesh) =>
                prefectures.includes(extractPrefName(mesh.name))
              )
              .map((mesh) => {
                let mat;
                if (
                  mesh.material &&
                  typeof mesh.material.clone === "function"
                ) {
                  mat = mesh.material.clone();
                  if (mat.map) mat.map = null;
                  if (hovered === mesh.name) {
                    mat.color = new THREE.Color(1, 1, 1); // 白
                    mat.opacity = 0.7;
                    mat.transparent = true;
                  } else {
                    mat.color = new THREE.Color("#3cb371");
                    mat.opacity = 1.0;
                    mat.transparent = false;
                  }
                  mat.needsUpdate = true;
                } else {
                  // fallback: 新規マテリアル
                  if (hovered === mesh.name) {
                    mat = new THREE.MeshStandardMaterial({
                      color: "white",
                      opacity: 0.7,
                      transparent: true,
                    });
                  } else {
                    mat = new THREE.MeshStandardMaterial({
                      color: "#3cb371",
                      opacity: 1.0,
                      transparent: false,
                    });
                  }
                }
                return (
                  <mesh
                    key={mesh.uuid}
                    geometry={mesh.geometry}
                    material={mat}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      setHovered(mesh.name);
                      setMouse({ x: e.clientX, y: e.clientY });
                    }}
                    onPointerOut={(e) => {
                      e.stopPropagation();
                      setHovered(null);
                    }}
                    onClick={() => moveCameraToMeshCenter(mesh)}
                  />
                );
              })}
          </group>
        ))}
      </group>
      {hovered && (
        <Html>
          <div
            style={{
              position: "fixed",
              left: mouse.x + 10,
              top: mouse.y - 10,
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "14px",
              pointerEvents: "none",
              zIndex: 1000,
              whiteSpace: "nowrap",
            }}
          >
            {hovered}
          </div>
        </Html>
      )}
    </>
  );
}
