import { assetUrl } from '../../utils/assetUrl'
const illustrations: Record<string, { src: string; alt: string }> = {
  Powertrain: {
    src: assetUrl('/images/engineering/powertrain.png'),
    alt: 'Detailed electric motor with visible copper windings',
  },
  Chassis: {
    src: assetUrl('/images/engineering/chassis.png'),
    alt: 'Automotive chassis frame with wheels and suspension',
  },
  Battery: {
    src: assetUrl('/images/engineering/battery.png'),
    alt: 'Electric vehicle battery pack with illuminated battery cells',
  },
  Materials: {
    src: assetUrl('/images/engineering/materials.png'),
    alt: 'Floating layers of carbon fibre and metallic engineering materials',
  },
  Simulation: {
    src: assetUrl('/images/engineering/simulation.png'),
    alt: 'Futuristic electric sports car surrounded by aerodynamic airflow lines',
  },
  Optimization: {
    src: assetUrl('/images/engineering/optimization.png'),
    alt: 'Vehicle performance optimization graph with efficiency indicators',
  },
}

export default function ModuleIllustration({ kind }: { kind: string }) {
  const illustration = illustrations[kind]
  if (!illustration) return null

  return (
    <div className="module-illustration">
      <img
        src={illustration.src}
        alt={illustration.alt}
        width={552}
        height={552}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
