import { useEffect, useState } from "react";
import { Shape, ExtrudeGeometry } from "three";
import * as d3 from "d3-geo";
import { Html, Line } from "@react-three/drei";

export default function JapanMap() {
  const [features, setFeatures] = useState([]);
  const [hoveredPrefecture, setHoveredPrefecture] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/japan.geojson")
      .then((res) => res.json())
      .then((data) => {
        setFeatures(data.features);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading GeoJSON:", error);
        setLoading(false);
      });
  }, []);

  const projection = d3
    .geoMercator()
    .center([137, 38])
    .scale(800)
    .translate([0, 0]);

  const handlePointerOver = (event, prefectureName) => {
    event.stopPropagation();
    setHoveredPrefecture(prefectureName);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    setHoveredPrefecture(null);
  };

  if (loading) {
    return (
      <Html center>
        <div className="loading">日本地図を読み込み中...</div>
      </Html>
    );
  }

  const scale = 0.1;
  const depth = 0.3;

  // 以前の配色
  const baseColor = "#4ecdc4";
  const hoverColor = "#ff6b6b";
  const borderColor = "white";

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {features.map((feature, idx) => {
        const { type, coordinates } = feature.geometry;
        const prefectureName =
          feature.properties.name ||
          feature.properties.NAME_1 ||
          `Prefecture ${idx}`;
        const isHovered = hoveredPrefecture === prefectureName;
        const elements = [];

        const processPolygon = (polygon, keyPrefix) => {
          // 超ローポリ化: 40個に1個だけ使う
          const filtered = polygon.filter(
            (_, index) => index % 40 === 0 || index === polygon.length - 1
          );
          if (filtered.length < 3) return;
          const points2d = filtered.map(([lng, lat]) => {
            const [x, y] = projection([lng, lat]);
            return [x, -y];
          });
          // Shape用
          const shape = new Shape();
          shape.moveTo(points2d[0][0], points2d[0][1]);
          points2d.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
          // Line用
          const points3d = points2d.map(([x, y]) => [x, y, depth]); // 上面に合わせる

          elements.push(
            <mesh
              key={`mesh-${keyPrefix}`}
              geometry={
                new ExtrudeGeometry(shape, {
                  depth: depth,
                  bevelEnabled: true,
                  bevelThickness: 0.08,
                  bevelSize: 0.08,
                  bevelOffset: 0,
                  bevelSegments: 2,
                  steps: 1,
                })
              }
              position={[0, 0, 0]}
              scale={[scale, scale, scale]}
              onPointerOver={(e) => handlePointerOver(e, prefectureName)}
              onPointerOut={handlePointerOut}
            >
              <meshStandardMaterial
                color={isHovered ? hoverColor : baseColor}
                transparent
                opacity={isHovered ? 0.95 : 0.8}
                metalness={0.1}
                roughness={0.7}
              />
            </mesh>
          );
          elements.push(
            <Line
              key={`line-${keyPrefix}`}
              points={points3d}
              color={borderColor}
              lineWidth={4}
              scale={[scale, scale, scale]}
              position={[0, 0, 0]}
            />
          );
        };

        if (type === "Polygon") {
          coordinates.forEach((polygon, i) =>
            processPolygon(polygon, `${idx}-${i}`)
          );
        }
        if (type === "MultiPolygon") {
          coordinates.forEach((multi, i) => {
            multi.forEach((polygon, j) =>
              processPolygon(polygon, `${idx}-${i}-${j}`)
            );
          });
        }
        return elements;
      })}
      {/* ホバー時の都道府県名表示 */}
      {hoveredPrefecture && (
        <Html position={[0, 0, 0]}>
          <div
            style={{
              position: "fixed",
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              fontSize: "14px",
              pointerEvents: "none",
              zIndex: 1000,
              whiteSpace: "nowrap",
            }}
          >
            {hoveredPrefecture}
          </div>
        </Html>
      )}
    </group>
  );
}
