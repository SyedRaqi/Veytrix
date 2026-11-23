import { assetUrl } from '../../utils/assetUrl'
import { Component, Suspense, useEffect, useMemo, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { ContactShadows, Environment, Html, OrbitControls } from '@react-three/drei'
import { Box3, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const DEFAULT_MODEL_URL = assetUrl('/models/vehicles/veytrix-vehicle.glb')
const DEFAULT_FALLBACK_IMAGE = assetUrl('/images/veytrix-car.png')

type ViewerStatus = 'checking' | 'ready' | 'missing' | 'error'
type Props = {
  modelUrl?: string
  fallbackImage?: string
  fallbackAlt?: string
  className?: string
  interactive?: boolean
  showCaption?: boolean
}

class ViewerErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function NormalizedVehicle({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url)
  const vehicle = useMemo(() => {
    const root = new Group()
    const model = gltf.scene.clone(true)
    model.traverse(object => {
      if (!(object instanceof Mesh)) return
      object.castShadow = true
      object.receiveShadow = true
      const tuneMaterial = (material: MeshStandardMaterial) => {
        const tuned = material.clone()
        tuned.envMapIntensity = Math.max(tuned.envMapIntensity, 1.15)
        return tuned
      }
      object.material = Array.isArray(object.material)
        ? object.material.map(material => material instanceof MeshStandardMaterial ? tuneMaterial(material) : material.clone())
        : object.material instanceof MeshStandardMaterial ? tuneMaterial(object.material) : object.material.clone()
    })
    root.add(model)
    root.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(root)
    const size = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    const horizontalLength = Math.max(size.x, size.z)
    const scale = horizontalLength > 0 ? 4.65 / horizontalLength : 1
    root.scale.setScalar(scale)
    root.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale)
    return root
  }, [gltf.scene])

  return <primitive object={vehicle} />
}

function ShowroomPlatform() {
  return <group>
    <mesh position={[0, -.12, 0]} receiveShadow>
      <cylinderGeometry args={[3.25, 3.25, .16, 96]} />
      <meshStandardMaterial color="#091827" metalness={.72} roughness={.28} />
    </mesh>
    <mesh position={[0, -.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[3.02, .032, 10, 128]} />
      <meshStandardMaterial color="#38dfff" emissive="#13a9e6" emissiveIntensity={2.1} metalness={.75} roughness={.22} />
    </mesh>
    <mesh position={[0, -.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.78, .018, 8, 128]} />
      <meshStandardMaterial color="#ff9b48" emissive="#de571d" emissiveIntensity={1.65} metalness={.7} roughness={.25} />
    </mesh>
    <mesh position={[0, 1.2, -1.15]} rotation={[0, 0, 0]}>
      <torusGeometry args={[3.05, .018, 8, 128]} />
      <meshStandardMaterial color="#348bf5" emissive="#1b79e5" emissiveIntensity={1.4} metalness={.65} roughness={.24} />
    </mesh>
    <mesh position={[0, 1.2, -1.12]} rotation={[0, .46, .12]}>
      <torusGeometry args={[3.4, .012, 8, 128]} />
      <meshStandardMaterial color="#9e5aff" emissive="#8037dc" emissiveIntensity={1.25} metalness={.62} roughness={.25} />
    </mesh>
  </group>
}

function ReflectiveStudio() {
  return <Environment resolution={128}>
    <mesh position={[0, 1.5, -5]}>
      <planeGeometry args={[13, 8]} />
      <meshBasicMaterial color="#162b48" />
    </mesh>
    <mesh position={[-4.5, 2.3, -1]} rotation={[0, .8, 0]}>
      <planeGeometry args={[2.5, 5]} />
      <meshBasicMaterial color="#29bfff" />
    </mesh>
    <mesh position={[4.3, 2.2, -1]} rotation={[0, -.8, 0]}>
      <planeGeometry args={[2.2, 4.5]} />
      <meshBasicMaterial color="#a44dff" />
    </mesh>
    <mesh position={[0, 4.2, -.4]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4, 2]} />
      <meshBasicMaterial color="#e0f3ff" />
    </mesh>
  </Environment>
}

function VehicleScene({ modelUrl, reducedMotion, interactive }: { modelUrl: string; reducedMotion: boolean; interactive: boolean }) {
  return <>
    <ReflectiveStudio />
    <ambientLight intensity={.72} />
    <hemisphereLight args={['#d2edff', '#07101c', 1.2]} />
    <directionalLight position={[4, 7, 5]} intensity={3.2} color="#d4edff" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight position={[-3, 2.2, -1]} intensity={38} distance={9} color="#39cfff" />
    <pointLight position={[3, 2, -2]} intensity={32} distance={8} color="#a354ff" />
    <pointLight position={[0, 1.1, 4]} intensity={24} distance={7} color="#ff963f" />
    <ShowroomPlatform />
    <NormalizedVehicle url={modelUrl} />
    <ContactShadows position={[0, -.025, 0]} opacity={.5} scale={7} blur={2.6} far={4} color="#030914" />
    <OrbitControls makeDefault enableDamping dampingFactor={.08} enablePan={false} enableRotate={interactive} enableZoom={interactive} minDistance={4.6} maxDistance={10.5} minPolarAngle={.34} maxPolarAngle={2.42} minAzimuthAngle={-Infinity} maxAzimuthAngle={Infinity} autoRotate={interactive && !reducedMotion} autoRotateSpeed={.38} target={[0, .8, 0]} />
  </>
}

function StaticFallback({ image, alt, missing }: { image: string; alt: string; missing: boolean }) {
  return <div className="vehicle-viewer-fallback">
    <img src={image} alt={alt} draggable={false} />
    <div className="vehicle-viewer-note">
      <b>STATIC IMAGE PREVIEW</b>
      <span>{missing ? 'Add frontend/public/models/vehicles/veytrix-vehicle.glb to enable interactive 3D.' : 'The 3D model could not be loaded. Add or repair frontend/public/models/vehicles/veytrix-vehicle.glb.'}</span>
    </div>
    <div className="vehicle-viewer-caption">STATIC REFERENCE - NO 3D ROTATION</div>
  </div>
}

export default function Vehicle3DViewer({ modelUrl = DEFAULT_MODEL_URL, fallbackImage = DEFAULT_FALLBACK_IMAGE, fallbackAlt = 'VEYTRIX electric sports sedan showroom reference', className = '', interactive = true, showCaption = true }: Props) {
  const [status, setStatus] = useState<ViewerStatus>('checking')
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(preference.matches)
    const updatePreference = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    preference.addEventListener('change', updatePreference)
    return () => preference.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    let active = true
    setStatus('checking')
    fetch(modelUrl, { method: 'HEAD' }).then(response => {
      if (active) setStatus(response.ok && !response.headers.get('content-type')?.includes('text/html') ? 'ready' : 'missing')
    }).catch(() => {
      if (active) setStatus('missing')
    })
    return () => { active = false }
  }, [modelUrl])

  if (status === 'missing' || status === 'error') return <div className={`vehicle-3d-viewer ${className}`}><StaticFallback image={fallbackImage} alt={fallbackAlt} missing={status === 'missing'} /></div>

  return <div className={`vehicle-3d-viewer vehicle-3d-viewer-live ${className}`} aria-label="Interactive 3D vehicle viewer">
    {status === 'checking' && <div className="vehicle-viewer-loading">Checking for 3D vehicle model...</div>}
    {status === 'ready' && <>
      <ViewerErrorBoundary onError={() => setStatus('error')}>
        <Canvas shadows dpr={[1, 1.4]} camera={{ position: [0, 2.65, 7.4], fov: 37 }} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={<Html center><span className="vehicle-model-loading">Loading vehicle model...</span></Html>}><VehicleScene modelUrl={modelUrl} reducedMotion={reducedMotion} interactive={interactive} /></Suspense>
        </Canvas>
      </ViewerErrorBoundary>
      {showCaption && <div className="vehicle-viewer-caption">DRAG TO ROTATE - SCROLL TO ZOOM</div>}
    </>}
  </div>
}
