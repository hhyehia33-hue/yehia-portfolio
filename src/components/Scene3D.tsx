import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Stars, Icosahedron, TorusKnot, Octahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

/* ---------------- Parallax wrapper: المشهد بيتحرك مع الماوس ---------------- */
function ParallaxGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const { x, y } = state.pointer;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x * 0.18, 0.04);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y * 0.12, 0.04);
  });
  return <group ref={ref}>{children}</group>;
}

/* عقدة ذهبية بتلف */
function GoldKnot() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.25;
    mesh.current.rotation.y += delta * 0.35;
  });
  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh} position={[-4.6, 1.3, -1.5]} rotation={[0.9, 0.4, 0]}>
        <torusKnotGeometry args={[0.95, 0.3, 180, 28]} />
        <meshStandardMaterial color="#e3b566" metalness={0.95} roughness={0.18} emissive="#3a2a08" emissiveIntensity={0.8} />
      </mesh>
    </Float>
  );
}

/* كريستالة بنفسجية مائلة */
function VioletCrystal() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.4;
    mesh.current.rotation.z += delta * 0.3;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.6}>
      <Icosahedron ref={mesh as never} args={[1.05, 0]} position={[4.4, -0.9, -1]}>
        <meshStandardMaterial color="#7c5cf0" metalness={0.9} roughness={0.1} flatShading emissive="#1b1140" emissiveIntensity={0.9} />
      </Icosahedron>
    </Float>
  );
}

/* شمعة سماوية صغيرة */
function CyanShard() {
  return (
    <Float speed={2.4} rotationIntensity={0.8} floatIntensity={2}>
      <Octahedron args={[0.4, 0]} position={[-3.4, -2.2, 0.5]}>
        <meshStandardMaterial color="#38d9e8" metalness={0.85} roughness={0.15} emissive="#0a3a44" emissiveIntensity={1.1} />
      </Octahedron>
    </Float>
  );
}

function GoldShard() {
  return (
    <Float speed={1.8} rotationIntensity={0.7} floatIntensity={1.8}>
      <Octahedron args={[0.28, 0]} position={[3.2, 2.3, 0.2]}>
        <meshStandardMaterial color="#e8c47c" metalness={0.95} roughness={0.12} emissive="#4a3410" emissiveIntensity={1} />
      </Octahedron>
    </Float>
  );
}

/* ---------------- خلفية الصفحة كاملة ---------------- */
export function HeroBackdrop() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.35} />
        <pointLight position={[6, 4, 4]} intensity={90} color="#ffd27d" />
        <pointLight position={[-6, -3, 3]} intensity={60} color="#8b5cf6" />
        <pointLight position={[0, -6, 2]} intensity={40} color="#38d9e8" />
        <ParallaxGroup>
          <GoldKnot />
          <VioletCrystal />
          <CyanShard />
          <GoldShard />
          <Stars radius={30} depth={50} count={1800} factor={3} saturation={0.4} fade speed={0.8} />
          <Sparkles count={55} scale={[12, 8, 8]} size={2.4} speed={0.35} color="#f0d7a2" />
          <Sparkles count={35} scale={[14, 9, 8]} size={3} speed={0.25} color="#9f8bf5" />
        </ParallaxGroup>
      </Canvas>
    </div>
  );
}

/* ---------------- حلقات 3D حوالين الصورة ---------------- */
function OrbitRing({
  radius,
  tube,
  color,
  emissive,
  speed,
  tilt,
}: {
  radius: number;
  tube: number;
  color: string;
  emissive: string;
  speed: number;
  tilt: [number, number];
}) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!g.current) return;
    g.current.rotation.z += delta * speed;
    g.current.rotation.y += delta * speed * 0.35;
  });
  return (
    <group ref={g} rotation={[tilt[0], tilt[1], 0]}>
      <Torus args={[radius, tube, 32, 140]}>
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.15} emissive={emissive} emissiveIntensity={1.2} />
      </Torus>
    </group>
  );
}

function OrbitingGem() {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.z = state.clock.elapsedTime * 0.7;
  });
  return (
    <group ref={g} rotation={[0.45, 0.15, 0]}>
      <Octahedron args={[0.09, 0]} position={[1.52, 0, 0]}>
        <meshStandardMaterial color="#ffd98f" emissive="#7a5310" emissiveIntensity={1.4} metalness={0.9} roughness={0.1} />
      </Octahedron>
      <Octahedron args={[0.055, 0]} position={[-1.52, 0, 0]}>
        <meshStandardMaterial color="#9f8bf5" emissive="#2c1a6e" emissiveIntensity={1.4} metalness={0.9} roughness={0.1} />
      </Octahedron>
    </group>
  );
}

export function PortraitRings() {
  return (
    <div className="absolute -inset-14 sm:-inset-20" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 4.4], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 3, 4]} intensity={60} color="#ffd27d" />
        <pointLight position={[-4, -3, 3]} intensity={40} color="#8b5cf6" />
        <OrbitRing radius={1.34} tube={0.035} color="#ecc078" emissive="#6b4d15" speed={0.55} tilt={[1.15, 0.35]} />
        <OrbitRing radius={1.62} tube={0.014} color="#8f6cf5" emissive="#35217a" speed={-0.42} tilt={[1.35, -0.5]} />
        <OrbitRing radius={1.13} tube={0.01} color="#4fe0ee" emissive="#0d4a55" speed={0.8} tilt={[1.05, 0.9]} />
        <OrbitingGem />
        <Sparkles count={26} scale={3.6} size={2.6} speed={0.45} color="#f5d9a8" />
      </Canvas>
    </div>
  );
}

/* شكل 3D صغير للكروت/الأرقام في قسم نبذة */
export function MiniKnot() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.5;
    mesh.current.rotation.y += delta * 0.6;
  });
  return (
    <Float speed={2.4} rotationIntensity={0.5} floatIntensity={1.4}>
      <TorusKnot ref={mesh as never} args={[0.62, 0.2, 140, 20]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#dfb065" metalness={0.95} roughness={0.16} emissive="#33250a" emissiveIntensity={1} />
      </TorusKnot>
    </Float>
  );
}

export function AboutCanvas() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 3.4], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={50} color="#ffd27d" />
        <pointLight position={[-3, -2, 2]} intensity={30} color="#8b5cf6" />
        <MiniKnot />
        <Sparkles count={20} scale={3} size={2} speed={0.3} color="#f0d7a2" />
      </Canvas>
    </div>
  );
}
