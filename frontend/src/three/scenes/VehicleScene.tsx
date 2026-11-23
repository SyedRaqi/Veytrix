import { Canvas } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls, RoundedBox, Sparkles } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { Color, Shape } from 'three'

type Props = { compact?: boolean }

const glass = '#10263b'
const blueMetal = '#167fc7'

function Wheel({ x, z }: { x: number; z: number }) {
  const spokes = Array.from({ length: 10 }, (_, i) => i * Math.PI / 5)
  return <group position={[x, .48, z]}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow><cylinderGeometry args={[.46, .46, .27, 48]} /><meshStandardMaterial color="#09111c" roughness={.42} metalness={.28} /></mesh>
    <mesh position={[0, 0, Math.sign(z) * .145]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.335, .335, .045, 48]} /><meshStandardMaterial color="#70869a" metalness={.92} roughness={.2} /></mesh>
    <mesh position={[0, 0, Math.sign(z) * .18]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.27, .27, .025, 48]} /><meshStandardMaterial color="#111b2a" metalness={.82} roughness={.25} /></mesh>
    <mesh position={[0, 0, Math.sign(z) * .205]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.105, .105, .045, 32]} /><meshStandardMaterial color="#4cdfff" emissive="#0a7aa7" emissiveIntensity={.7} metalness={.8} /></mesh>
    {spokes.map((a, i) => <mesh key={i} position={[Math.sin(a) * .19, Math.cos(a) * .19, Math.sign(z) * .2]} rotation={[0, 0, -a]} castShadow><boxGeometry args={[.045, .33, .025]} /><meshStandardMaterial color="#b8d2e2" metalness={.92} roughness={.2} /></mesh>)}
    <mesh position={[0, 0, Math.sign(z) * .14]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.30, .018, 8, 48]} /><meshStandardMaterial color="#ff9a44" emissive="#b84912" emissiveIntensity={.45} metalness={.7} /></mesh>
  </group>
}

function TurbineEmblem() {
  const blade = useMemo(() => {
    const s = new Shape(); s.moveTo(0, .24); s.quadraticCurveTo(.3, .38, .47, .17); s.lineTo(.11, -.3); s.quadraticCurveTo(-.02, -.38, -.08, -.2); s.closePath(); return s
  }, [])
  const vMark = useMemo(() => {
    const s = new Shape(); s.moveTo(-.82, .65); s.lineTo(-.48, .65); s.lineTo(0, -.12); s.lineTo(.48, .65); s.lineTo(.82, .65); s.lineTo(.12, -.72); s.lineTo(-.12, -.72); s.closePath(); return s
  }, [])
  return <group position={[-.1, 2.2, -.45]} scale={.48}>
    <mesh position={[0, 0, -.07]}><torusGeometry args={[.82, .022, 10, 96]} /><meshStandardMaterial color="#64dfff" emissive="#16aaff" emissiveIntensity={2.4} /></mesh>
    {[0, 1, 2, 3, 4, 5].map(i => <mesh key={i} position={[0, 0, .02]} rotation={[0, 0, i * Math.PI / 3]}>
      <shapeGeometry args={[blade]} /><meshStandardMaterial color={i % 2 ? '#af75ff' : '#44d8ff'} emissive={i % 2 ? '#6428bb' : '#087aaa'} emissiveIntensity={.65} metalness={.82} roughness={.22} side={2} />
    </mesh>)}
    <mesh position={[0, 0, .13]}><shapeGeometry args={[vMark]} /><meshPhysicalMaterial color="#a8d9ee" emissive="#237db7" emissiveIntensity={.5} metalness={.96} roughness={.18} clearcoat={1} side={2} /></mesh>
    <mesh position={[0, 0, .1]}><torusGeometry args={[.2, .035, 12, 48]} /><meshStandardMaterial color="#e7f8ff" emissive="#63dfff" emissiveIntensity={1.4} metalness={.9} /></mesh>
  </group>
}

function Vehicle() {
  const sideGlass = useMemo(() => {
    const s = new Shape(); s.moveTo(-1.05, 0); s.lineTo(-.72, .54); s.lineTo(.55, .54); s.lineTo(1.03, .05); s.lineTo(.9, 0); s.closePath(); return s
  }, [])
  const windshield = useMemo(() => {
    const s = new Shape(); s.moveTo(0, 0); s.lineTo(.1, .5); s.lineTo(.52, .5); s.lineTo(.6, 0); s.closePath(); return s
  }, [])
  return <group>
    {/* low, wide unibody with sculpted shoulder and separate aero surfaces */}
    <RoundedBox args={[4.15, .67, 1.82]} radius={.19} smoothness={5} position={[0, .79, 0]} castShadow receiveShadow><meshPhysicalMaterial color={blueMetal} metalness={.84} roughness={.22} clearcoat={1} clearcoatRoughness={.12} /></RoundedBox>
    <RoundedBox args={[1.15, .25, 1.78]} radius={.1} smoothness={4} position={[1.43, .96, 0]} castShadow><meshPhysicalMaterial color="#30a8ee" metalness={.72} roughness={.2} clearcoat={1} /></RoundedBox>
    <RoundedBox args={[1.0, .28, 1.79]} radius={.11} smoothness={4} position={[-1.55, .91, 0]} castShadow><meshPhysicalMaterial color="#11659f" metalness={.86} roughness={.2} clearcoat={1} /></RoundedBox>
    {/* panoramic SUV canopy */}
    <mesh position={[-.04, 1.15, 0]} castShadow><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([-1.08,0,-.79, -.68,.67,-.66, .55,.67,-.66, 1.02,.02,-.78, -1.08,0,.79, -.68,.67,.66, .55,.67,.66, 1.02,.02,.78]), 3]} /><bufferAttribute attach="index" args={[new Uint16Array([0,1,2,0,2,3,4,7,6,4,6,5,1,5,6,1,6,2,0,3,7,0,7,4,3,2,6,3,6,7]), 1]} /></bufferGeometry><meshPhysicalMaterial color="#101d31" metalness={.58} roughness={.14} transparent opacity={.88} clearcoat={1} side={2} /></mesh>
    {/* side windows */}
    {[-1, 1].map(side => <mesh key={side} position={[-.04, 1.16, side * .798]}><shapeGeometry args={[sideGlass]} /><meshPhysicalMaterial color={glass} metalness={.42} roughness={.12} transparent opacity={.82} clearcoat={1} side={2} /></mesh>)}
    {/* front and rear glazing */}
    <mesh position={[.98, 1.16, -.29]} rotation={[0, Math.PI / 2, 0]}><shapeGeometry args={[windshield]} /><meshPhysicalMaterial color="#17354c" metalness={.5} roughness={.11} transparent opacity={.83} side={2} /></mesh>
    <mesh position={[-1.03, 1.15, .29]} rotation={[0, -Math.PI / 2, 0]}><shapeGeometry args={[windshield]} /><meshPhysicalMaterial color="#142c41" metalness={.5} roughness={.12} transparent opacity={.84} side={2} /></mesh>
    {/* roof rails, panoramic roof seam and body details */}
    {[-.67, .67].map(z => <mesh key={z} position={[-.08, 1.84, z]} castShadow><boxGeometry args={[1.46, .035, .045]} /><meshStandardMaterial color="#a4c3d2" metalness={.9} roughness={.2} /></mesh>)}
    <RoundedBox args={[.75, .07, .08]} radius={.025} position={[-.08, 1.83, 0]}><meshStandardMaterial color="#728ea4" metalness={.9} /></RoundedBox>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[0, .62, side * .916]}><boxGeometry args={[2.15, .075, .035]} /><meshStandardMaterial color="#60dcff" emissive="#14aeef" emissiveIntensity={1.6} /></mesh>
      <mesh position={[.05, .9, side * .936]}><boxGeometry args={[.67, .035, .025]} /><meshStandardMaterial color="#9cdcff" metalness={.7} /></mesh>
      {[-.48, .48].map(x => <mesh key={x} position={[x, .89, side * .943]}><boxGeometry args={[.17, .025, .018]} /><meshStandardMaterial color="#d8edff" metalness={.8} /></mesh>)}
    </group>)}
    {/* sculpted wheel arch rings */}
    {[-1.25, 1.25].flatMap(x => [-.87, .87].map(z => <mesh key={x + ':' + z} position={[x, .49, z]} rotation={[0, 0, 0]}><torusGeometry args={[.49, .045, 10, 56]} /><meshStandardMaterial color="#64bbec" metalness={.75} roughness={.25} /></mesh>))}
    {[-1.25, 1.25].flatMap(x => [-.89, .89].map(z => <Wheel key={x + ':' + z} x={x} z={z} />))}
    {/* fascia, luminous matrix headlights, rear light bar */}
    <RoundedBox args={[.11, .17, 1.12]} radius={.05} position={[2.08, .87, 0]}><meshStandardMaterial color="#121c2a" metalness={.8} /></RoundedBox>
    {[-.57, .57].map(z => <group key={z}>
      <mesh position={[2.11, 1.02, z]}><boxGeometry args={[.055, .095, .48]} /><meshStandardMaterial color="#e6faff" emissive="#6edfff" emissiveIntensity={3.2} /></mesh>
      <mesh position={[2.13, .69, z]}><boxGeometry args={[.06, .035, .44]} /><meshStandardMaterial color="#ff9a45" emissive="#f05216" emissiveIntensity={2.2} /></mesh>
      <mesh position={[-2.08, .98, z]}><boxGeometry args={[.045, .07, .55]} /><meshStandardMaterial color="#ff4f82" emissive="#ff164f" emissiveIntensity={2.5} /></mesh>
    </group>)}
    {/* underbody chassis rails and cross-members */}
    {[-.57, .57].map(z => <mesh key={z} position={[0, .31, z]} castShadow><boxGeometry args={[3.55, .12, .11]} /><meshStandardMaterial color="#394c5e" metalness={.86} roughness={.28} /></mesh>)}
    {[-1.25, -.45, .45, 1.25].map(x => <mesh key={x} position={[x, .31, 0]}><boxGeometry args={[.1, .1, 1.25]} /><meshStandardMaterial color="#64798b" metalness={.86} /></mesh>)}
    {/* high voltage battery enclosure, modules and bus bars */}
    <RoundedBox args={[1.63, .22, .92]} radius={.08} position={[-.05, .38, 0]} castShadow><meshStandardMaterial color="#102c3b" metalness={.72} roughness={.3} /></RoundedBox>
    {Array.from({ length: 8 }, (_, i) => <RoundedBox key={i} args={[.34, .12, .38]} radius={.035} position={[-.63 + (i % 4) * .39, .53, (i < 4 ? -.22 : .22)]}><meshPhysicalMaterial color={i % 2 ? '#16bde3' : '#1486bb'} emissive="#007aa2" emissiveIntensity={.65} metalness={.75} roughness={.22} /></RoundedBox>)}
    {[-.32, .32].map(z => <mesh key={z} position={[-.04, .61, z]}><boxGeometry args={[1.42, .025, .025]} /><meshStandardMaterial color="#ff9b48" emissive="#c65316" emissiveIntensity={.85} metalness={.75} /></mesh>)}
    {/* rear motor with cooling fins and copper stator */}
    <group position={[-1.35, .5, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[.29, .29, .62, 40]} /><meshStandardMaterial color="#71889b" metalness={.92} roughness={.24} /></mesh>
      {Array.from({ length: 9 }, (_, i) => <mesh key={i} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[.27, .018, 6, 40]} /><meshStandardMaterial color="#c6dce7" metalness={.95} /></mesh>)}
      <mesh position={[0, 0, .32]}><torusGeometry args={[.2, .035, 10, 40]} /><meshStandardMaterial color="#ff8d3b" emissive="#b54612" emissiveIntensity={1.2} metalness={.7} /></mesh>
    </group>
    {/* front inverter and suspension */}
    <RoundedBox args={[.42, .16, .52]} radius={.06} position={[1.12, .48, 0]}><meshStandardMaterial color="#2d4355" metalness={.82} /></RoundedBox>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[1.23, .48, side * .62]} rotation={[0, 0, -.4]}><cylinderGeometry args={[.035, .035, .62, 12]} /><meshStandardMaterial color="#9fb6c6" metalness={.9} /></mesh>
      <mesh position={[-1.25, .48, side * .62]} rotation={[0, 0, .35]}><cylinderGeometry args={[.035, .035, .58, 12]} /><meshStandardMaterial color="#9fb6c6" metalness={.9} /></mesh>
    </group>)}
    <TurbineEmblem />
  </group>
}

function Platform() {
  return <group position={[0, -.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <mesh receiveShadow><cylinderGeometry args={[3.18, 3.18, .12, 96]} /><meshStandardMaterial color="#0b1827" metalness={.72} roughness={.3} /></mesh>
    <mesh position={[0, .075, 0]}><torusGeometry args={[2.95, .035, 12, 120]} /><meshStandardMaterial color="#39cfff" emissive="#139bd8" emissiveIntensity={2.1} /></mesh>
    <mesh position={[0, .09, 0]}><torusGeometry args={[2.77, .022, 10, 120]} /><meshStandardMaterial color="#ff9a45" emissive="#d14a15" emissiveIntensity={1.5} /></mesh>
    <mesh position={[0, .1, 0]}><torusGeometry args={[2.58, .012, 8, 120]} /><meshStandardMaterial color="#a35cff" emissive="#6f24dc" emissiveIntensity={1.4} /></mesh>
  </group>
}

export default function VehicleScene({ compact = false }: Props) {
  return <div className="vehicle-canvas">
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: compact ? [4.9, 2.7, 6.1] : [4.2, 2.55, 5.2], fov: 37 }} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={[new Color('#07111e')]} />
      <fog attach="fog" args={['#07111e', 10, 23]} />
      <ambientLight intensity={.72} />
      <hemisphereLight args={['#b9e8ff', '#07101c', 1.1]} />
      <directionalLight position={[4, 7, 5]} intensity={3.1} color="#c4eaff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[1, 2.5, 3]} intensity={44} distance={8} color="#32cfff" />
      <pointLight position={[-3, 1.5, -2]} intensity={35} distance={8} color="#9a4fff" />
      <pointLight position={[3, 1, -1]} intensity={24} distance={6} color="#ff8d3c" />
      <Suspense fallback={null}>
        <Float speed={.65} rotationIntensity={.025} floatIntensity={.04}>
          <Vehicle />
        </Float>
        <Platform />
        <Sparkles count={compact ? 34 : 60} scale={[7, 3, 5]} size={2.1} speed={.18} color="#69dfff" />
        <ContactShadows position={[0, -.015, 0]} opacity={.58} scale={8} blur={2.8} far={4} color="#05111d" />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3.7} maxPolarAngle={Math.PI / 2.05} target={[0, .85, 0]} autoRotate autoRotateSpeed={.32} />
    </Canvas>
  </div>
}
