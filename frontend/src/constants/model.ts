import { assetUrl } from '../utils/assetUrl'
import type { SimulationConfigurations } from '../features/simulation-engine/simulationModes'

export type PageId = 'home' | 'studio' | 'simulation' | 'library' | 'materials' | 'optimization' | 'analytics' | 'reports' | 'explore' | 'profile'

export type VehicleProject = {
  id: string
  name: string
  description: string
  body: string
  powertrain: string
  material: string
  dimensions?: { length: number; width: number; height: number }
  targets?: { range: number; battery: number; drag: number }
  simulationSettings?: SimulationConfigurations
  optimizationSettings?: { objectives: string[]; massLimit: number; costLimit: number }
  versions?: ProjectVersion[]
  componentHistory?: { name: string; action: 'added' | 'removed'; at: string }[]
  materialHistory?: { name: string; at: string }[]
  selectedComponents?: string[]
  createdAt: string
  updatedAt: string
  status: 'Draft' | 'In progress' | 'Validated'
}

export type ProjectVersion = {
  number: number
  savedAt: string
  name: string
  description: string
  body: string
  powertrain: string
  material: string
  selectedComponents?: string[]
  dimensions?: { length: number; width: number; height: number }
  targets?: { range: number; battery: number; drag: number }
  simulationSettings?: SimulationConfigurations
  optimizationSettings?: { objectives: string[]; massLimit: number; costLimit: number }
}

export type SavedReport = { id: string; projectId: string; title: string; createdAt: string; projectSnapshot?: VehicleProject; simulationSnapshot?: SimulationRun; includedSections?: string[] }
export type SimulationRun = {
  id: string
  projectId: string
  projectName: string
  module: string
  createdAt: string
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Demo complete'
  calculationVersion?: string
  inputs?: Record<string, number | string>
  assumptions?: string[]
  selectedComponents?: string[]
}

export const initialProjects: VehicleProject[] = [
  { id: 'project-aero', name: 'Aero Concept 01', description: 'Long-range electric sports coupe', body: 'Sports Coupe', powertrain: 'Electric', material: 'Carbon Fiber', selectedComponents: ['VX-210 Electric Motor', 'V-Cell 96 Battery Pack'], createdAt: '2026-11-14', updatedAt: '2026-11-18', status: 'In progress' },
  { id: 'project-urban', name: 'Urban Motion', description: 'Compact electric city platform', body: 'Hatchback', powertrain: 'Electric', material: 'Aluminium Alloy', selectedComponents: [], createdAt: '2026-11-09', updatedAt: '2026-11-16', status: 'Draft' },
]

export const demoMetrics = [
  { label: 'Range estimate', value: 458, unit: 'km', trend: '+8.7%', color: 'cyan' },
  { label: 'Energy efficiency', value: 92.4, unit: 'km / 100 kWh', trend: '+11.9%', color: 'violet' },
  { label: 'Vehicle mass', value: 1680, unit: 'kg', trend: '−18.6%', color: 'blue' },
  { label: 'CO₂ estimate', value: 38, unit: '% below baseline', trend: '−38.0%', color: 'green' },
]

export const navItems: { id: PageId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'studio', label: 'Vehicle Studio', icon: '◈' },
  { id: 'simulation', label: 'Simulation Lab', icon: '⌁' },
  { id: 'library', label: 'Component Library', icon: '▦' },
  { id: 'materials', label: 'Material Intelligence', icon: '▤' },
  { id: 'optimization', label: 'Optimization Engine', icon: '⚙' },
  { id: 'analytics', label: 'Engineering Analytics', icon: '◉' },
  { id: 'reports', label: 'Engineering Reports', icon: '▣' },
  { id: 'explore', label: 'Explore', icon: '◎' },
  { id: 'profile', label: 'Projects & Profile', icon: '♙' },
]

export const components = [
  { name: 'VX-210 Electric Motor', category: 'Powertrain', image: assetUrl('/images/components/electric-motor.png'), power: '210 kW', torque: '420 Nm', weight: '68 kg', cost: '$4,800', fit: 'Sports Coupe · Sedan · SUV' },
  { name: 'VX Dual-Range Inverter', category: 'Electronics', image: assetUrl('/images/components/inverter.png'), power: '250 kW', torque: '—', weight: '12 kg', cost: '$1,250', fit: 'Electric · Hybrid' },
  { name: 'V-Cell 96 Battery Pack', category: 'Battery', image: assetUrl('/images/components/battery-pack.png'), power: '82 kWh', torque: '—', weight: '418 kg', cost: '$9,600', fit: 'Sports Coupe · Sedan' },
  { name: 'Active Thermal Loop', category: 'Cooling', image: assetUrl('/images/components/thermal-loop.png'), power: '11 kW', torque: '—', weight: '24 kg', cost: '$880', fit: 'Electric · Hybrid' },
  { name: 'Adaptive Drive Unit', category: 'Powertrain', image: assetUrl('/images/components/drive-unit.png'), power: '320 kW', torque: '610 Nm', weight: '104 kg', cost: '$6,900', fit: 'SUV · Concept' },
  { name: 'Carbon Monocoque', category: 'Chassis', image: assetUrl('/images/components/carbon-monocoque.png'), power: '—', torque: '—', weight: '186 kg', cost: '$12,400', fit: 'Sports Coupe · Concept' },
  { name: 'Active Suspension Set', category: 'Chassis', image: assetUrl('/images/components/suspension-set.png'), power: '—', torque: '—', weight: '42 kg', cost: '$2,100', fit: 'All vehicle types' },
  { name: 'Regenerative Brake System', category: 'Braking', image: assetUrl('/images/components/regenerative-brakes.png'), power: '—', torque: '—', weight: '36 kg', cost: '$1,540', fit: 'Electric · Hybrid' },
  { name: 'VX-180 Turbo Inline Engine', category: 'Powertrain', image: assetUrl('/images/components/turbo-engine.png'), power: '180 kW', torque: '340 Nm', weight: '142 kg', cost: '$5,200', fit: 'Sports Coupe · Sedan · SUV' },
  { name: 'Eight-Speed Dual-Clutch', category: 'Transmission', image: assetUrl('/images/components/dual-clutch.png'), power: '450 Nm', torque: '8 ratios', weight: '78 kg', cost: '$3,400', fit: 'Conventional · Hybrid' },
  { name: 'Double-Wishbone Suspension', category: 'Chassis', image: assetUrl('/images/components/double-wishbone.png'), power: 'Adaptive', torque: '—', weight: '54 kg', cost: '$2,800', fit: 'Sports Coupe · Concept' },
  { name: 'Brake-by-Wire Control Unit', category: 'Electronics', image: assetUrl('/images/components/brake-control-unit.png'), power: '48 V', torque: '—', weight: '4.2 kg', cost: '$640', fit: 'Electric · Hybrid · Conventional' },
]

export const materials = [
  { name: 'Carbon Fiber Composite', short: 'Carbon Fiber', density: 1.6, strength: 600, modulus: 70, thermal: 8, cost: 42, use: 'Monocoque, body panels', color: '#24d8ff' },
  { name: 'Aluminium Alloy 7075', short: 'Aluminium Alloy', density: 2.8, strength: 570, modulus: 72, thermal: 130, cost: 8, use: 'Chassis, suspension', color: '#abc8e7' },
  { name: 'Titanium Alloy Ti-6Al-4V', short: 'Titanium Alloy', density: 4.4, strength: 950, modulus: 114, thermal: 7, cost: 68, use: 'Fasteners, high-load joints', color: '#9c80ff' },
  { name: 'Magnesium Alloy AZ91', short: 'Magnesium Alloy', density: 1.8, strength: 230, modulus: 45, thermal: 51, cost: 12, use: 'Seat frames, housings', color: '#ffab55' },
  { name: 'High-Strength Steel', short: 'High-Strength Steel', density: 7.8, strength: 1200, modulus: 210, thermal: 45, cost: 3, use: 'Safety cage, crumple zones', color: '#70a0cc' },
  { name: 'Graphene Composite', short: 'Graphene Composite', density: 1.4, strength: 800, modulus: 125, thermal: 250, cost: 95, use: 'Battery thermal layers', color: '#ea71ee' },
]

export const chartData = [
  { month: 'Jun', efficiency: 78, range: 382, baseline: 72 }, { month: 'Jul', efficiency: 81, range: 394, baseline: 73 },
  { month: 'Aug', efficiency: 80, range: 402, baseline: 74 }, { month: 'Sep', efficiency: 86, range: 421, baseline: 75 },
  { month: 'Oct', efficiency: 89, range: 442, baseline: 76 }, { month: 'Nov', efficiency: 92, range: 458, baseline: 77 },
]
