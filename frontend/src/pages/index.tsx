import { assetUrl } from '../utils/assetUrl'
import { useEffect, useMemo, useState } from 'react'
import type * as React from 'react'
import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Battery, Box, Check, ChevronRight, CircleHelp, Download, FileText, Gauge, Layers3, LockKeyhole, Plus, RotateCcw, Save, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Thermometer, Wind, X } from 'lucide-react'
import ModuleIllustration from '../components/home/ModuleIllustration'
import Vehicle3DViewer from '../components/vehicle/Vehicle3DViewer'
import { createSimulationDefaults, calculateSimulationForType, simulationFields } from '../features/simulation-engine/simulationModes'
import { addProjectComponent, removeProjectComponent } from '../features/project-components/configuration'
import type { SimulationCalculation, SimulationConfigurations, SimulationType } from '../features/simulation-engine/simulationModes'
import type { LucideIcon } from 'lucide-react'
import { components, demoMetrics, materials, type PageId, type SavedReport, type SimulationRun, type VehicleProject } from '../constants/model'

type Props = {
  navigate: (page: PageId) => void
  notify: (message: string) => void
  projects: VehicleProject[]
  setProjects: React.Dispatch<React.SetStateAction<VehicleProject[]>>
  currentProject?: VehicleProject
  currentProjectId: string
  setCurrentProjectId: (id: string) => void
  saveProject: (draft: Omit<VehicleProject, 'id' | 'createdAt' | 'updatedAt' | 'status'>, existingId?: string) => string
  reports: SavedReport[]
  simulationRuns: SimulationRun[]
  createReport: (title: string, includedSections?: string[]) => SavedReport
  recordSimulation: (module: string, details?: { calculationVersion: string; inputs: Record<string, number | string>; assumptions: string[]; selectedComponents?: string[] }) => void
}

const definitions = {
  home: ['VEHICLE ENGINEERING PLATFORM', 'Design. Simulate. Optimize.', 'Build your next vehicle in a connected engineering workspace. Configure components, explore materials and turn design questions into clear, traceable results.'],
  studio: ['VEHICLE STUDIO', 'Build with intent.', 'Bring a vehicle concept into a structured, configurable engineering workspace.'],
  simulation: ['VIRTUAL TEST FACILITY', 'Test the whole system.', 'Explore aerodynamic, thermal, structural and energy behavior with clearly labeled demonstration models.'],
  library: ['ENGINEERING LIBRARY', 'The right part, in context.', 'Browse a curated demonstration library of vehicle systems and compare the details that matter.'],
  materials: ['MATERIAL INTELLIGENCE', 'Choose material with context.', 'Compare indicative properties, weight implications and common applications across candidate materials.'],
  optimization: ['DESIGN EXPLORER', 'Find the trade-off.', 'Set engineering priorities and explore an illustrative recommendation for your current configuration.'],
  analytics: ['ENGINEERING ANALYTICS', 'See the design move.', 'Review trends and compare a demonstration vehicle against a baseline configuration.'],
  reports: ['ENGINEERING REPORTS', 'Make the work reviewable.', 'Assemble a clear project summary with configuration details and demonstration results.'],
  explore: ['ENGINEERING JOURNAL', 'Ideas for what comes next.', 'Explore design notes, engineering guides and technology briefings for the next generation of mobility.'],
  profile: ['YOUR WORKSPACE', 'Projects, in one place.', 'Manage local vehicle projects, recent reports and workspace preferences.'],
}

function PageIntro({ page, eyebrow, title, description, action }: { page: keyof typeof definitions; eyebrow?: React.ReactNode; title?: React.ReactNode; description?: string; action?: React.ReactNode }) {
  const data = definitions[page]
  return <div className="page-intro"><div className="eyebrow"><span className="eyebrow-mark" />{eyebrow ?? data[0]}</div><h1>{title ?? data[1].split('. ').map((part, index) => <span key={part}>{index > 0 && <br />}{part}{index < data[1].split('. ').length - 1 && '.'}</span>)}</h1><p>{description ?? data[2]}</p>{action && <div className="intro-actions">{action}</div>}</div>
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="section-title"><div>{eyebrow && <span className="eyebrow small-eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>
}
function DemoFlag({ children = 'DEMONSTRATION DATA' }: { children?: React.ReactNode }) { return <span className="demo-flag"><span className="live-dot" />{children}</span> }
function Button({ children, variant = 'primary', onClick, icon, type = 'button', disabled = false }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; onClick?: () => void; icon?: React.ReactNode; type?: 'button' | 'submit'; disabled?: boolean }) { return <button type={type} disabled={disabled} className={`button button-${variant}`} onClick={onClick}>{icon}{children}</button> }
function StatCard({ label, value, unit, change, icon: Icon, color = 'cyan' }: { label: string; value: string | number; unit: string; change?: string; icon?: LucideIcon; color?: string }) { return <div className={`stat-card accent-${color}`}><div className="stat-heading">{Icon && <Icon size={16} />}<span>{label}</span></div><div className="stat-value">{value}<small>{unit}</small></div>{change && <div className="stat-change"><ArrowUpRight size={13} />{change} <span>demo vs. baseline</span></div>}</div> }
function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <section className={`panel ${className}`}>{children}</section> }
function MaterialSwatch({ color, name }: { color: string; name: string }) { return <div className="material-swatch" style={{ '--swatch': color } as React.CSSProperties} title={name}><span /></div> }
function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) { return <div className="empty-state"><div className="empty-icon"><Box size={24} /></div><h3>{title}</h3><p>{body}</p>{action}</div> }

export function HomePage({ navigate }: Props) {
  const cards = [
    { title: 'Powertrain', sub: 'Motor Â· Inverter Â· Drive', page: 'library' as PageId, tone: 'orange' }, { title: 'Chassis', sub: 'Frame Â· Wheels Â· Suspension', page: 'studio' as PageId, tone: 'blue' },
    { title: 'Battery', sub: 'Cells Â· Pack Â· Thermal', page: 'library' as PageId, tone: 'cyan' }, { title: 'Materials', sub: 'Carbon Â· Aluminium Â· Titanium', page: 'materials' as PageId, tone: 'violet' },
    { title: 'Simulation', sub: 'Aerodynamics Â· Performance', page: 'simulation' as PageId, tone: 'cyan' }, { title: 'Optimization', sub: 'Efficiency Â· Range Â· Cost', page: 'optimization' as PageId, tone: 'pink' },
  ]
  const steps = ['Concept', 'Configure', 'Simulate', 'Optimize', 'Validate']
  return <>
    <section className="home-hero">
      <div className="hero-copy"><PageIntro page="home" title={<>Design. Simulate.<br />Optimize.<br /><span className="gradient-text">Vehicles Virtually.</span></>} /><div className="hero-actions"><Button onClick={() => navigate('studio')} icon={<Sparkles size={16} />}>Start engineering <ArrowRight size={16} /></Button><Button variant="secondary" onClick={() => navigate('explore')}><span className="play-icon">â–¶</span> Watch demo</Button></div><div className="hero-proof"><span><ShieldCheck size={15} /> Connected engineering workflow</span><span>â— Local prototype workspace</span></div></div>
      <div className="hero-visual"><div className="hero-showroom"><Vehicle3DViewer /></div><div className="hero-telemetry telemetry-left"><span>POWER UNIT</span><b>VX ? 210 kW</b><i>? ONLINE</i></div><div className="hero-telemetry telemetry-right"><span>AERO PROFILE</span><b>Cd 0.248</b><i>DEMO MODEL</i></div></div>
      <div className="hero-bottomline"><span>VIRTUAL VEHICLE ENGINEERING PLATFORM</span><span>EXPLORE A CONNECTED DESIGN WORKFLOW <ArrowDownRight size={14} /></span></div>
    </section>
    <section className="home-modules"><SectionTitle eyebrow="One connected workflow" title="Engineering tools, working together" action={<button className="text-button" onClick={() => navigate('studio')}>Open Vehicle Studio <ArrowRight size={15} /></button>} /><div className="module-grid">{cards.map((card, index) => <motion.button whileHover={{ y: -4, scale: 1.012 }} whileTap={{ scale: .99 }} className={`module-card module-${card.tone}`} key={card.title} onClick={() => navigate(card.page)}><span className="module-index">0{index + 1}</span><div className="module-art"><div className="module-orbit" /><ModuleIllustration kind={card.title} /></div><div className="module-card-copy"><b>{card.title}</b><span>{card.sub}</span></div><span className="module-arrow" aria-hidden="true"><ArrowRight size={17} /></span></motion.button>)}</div></section>
    <section className="home-lower"><Panel className="flow-panel"><SectionTitle eyebrow="From idea to insight" title="Project flow" /><div className="workflow">{steps.map((step, index) => <div className={`workflow-step ${index === 1 ? 'workflow-current' : ''}`} key={step}><span className="workflow-num">0{index + 1}</span><b>{step}</b>{index < steps.length - 1 && <span className="workflow-connector" />}</div>)}</div><p className="muted">Move from a concept to a documented design review, with each step attached to your project.</p></Panel><Panel className="performance-panel"><div className="performance-heading"><div><span className="eyebrow small-eyebrow">CURRENT CONCEPT</span><h2>Performance snapshot</h2></div><DemoFlag /></div><div className="performance-stats">{demoMetrics.map(metric => <StatCard key={metric.label} label={metric.label} value={metric.value} unit={metric.unit} change={metric.trend} color={metric.color} />)}</div><small className="data-note">Illustrative values for interface demonstration only. Not validated engineering results.</small></Panel></section>
  </>
}

const vehicleRenderAssets: Record<string, string> = {
  'Sports Coupe': assetUrl('/images/vehicles/veytrix-coupe-render.png'),
  SUV: assetUrl('/images/vehicles/veytrix-suv-render.png'),
  Sedan: assetUrl('/images/vehicles/veytrix-sedan-render.png'),
  Hatchback: assetUrl('/images/vehicles/veytrix-hatch-render.png'),
  Concept: assetUrl('/images/vehicles/veytrix-concept-render.png'),
}

function VehicleAssetImage({ body, className, loading = 'lazy' }: { body: string; className: string; loading?: 'eager' | 'lazy' }) {
  const [missing, setMissing] = useState(false)
  const src = vehicleRenderAssets[body] ?? vehicleRenderAssets['Sports Coupe']
  useEffect(() => { setMissing(false) }, [src])
  if (missing) return <span className={`${className} vehicle-asset-warning`} role="img" aria-label={`${body} vehicle image unavailable`}>Preview unavailable</span>
  return <img className={className} src={src} alt={`${body} vehicle preview`} loading={loading} decoding="async" onError={() => { if (import.meta.env.DEV) console.warn(`[VEYTRIX] Vehicle preview asset failed to load: ${src}`); setMissing(true) }} />
}

function StudioVehiclePreview({ body }: { body: string }) {
  return <div className="studio-vehicle-preview" key={body}><VehicleAssetImage body={body} className="studio-vehicle-image" loading="eager" /></div>
}

export function StudioPage({ currentProject, currentProjectId, saveProject, navigate, notify, setProjects }: Props) {
  const [name, setName] = useState(currentProject?.name ?? '')
  const [description, setDescription] = useState(currentProject?.description ?? '')
  const [body, setBody] = useState(currentProject?.body ?? 'Sports Coupe')
  const [powertrain, setPowertrain] = useState(currentProject?.powertrain ?? 'Electric')
  const [material, setMaterial] = useState(currentProject?.material ?? 'Carbon Fiber')
  const [wizard, setWizard] = useState(false)
  const [dimensions, setDimensions] = useState(currentProject?.dimensions ?? { length: 4.5, width: 1.9, height: 1.4 })
  const [targets, setTargets] = useState(currentProject?.targets ?? { range: 450, battery: 82, drag: 0.26 })
  useEffect(() => {
    setName(currentProject?.name ?? '')
    setDescription(currentProject?.description ?? '')
    setBody(currentProject?.body ?? 'Sports Coupe')
    setPowertrain(currentProject?.powertrain ?? 'Electric')
    setMaterial(currentProject?.material ?? 'Carbon Fiber')
    setDimensions(currentProject?.dimensions ?? { length: 4.5, width: 1.9, height: 1.4 })
    setTargets(currentProject?.targets ?? { range: 450, battery: 82, drag: 0.26 })
  }, [currentProjectId])
  const onSave = () => { if (!name.trim()) { notify('Add a project name before saving'); return } saveProject({ name: name.trim(), description, body, powertrain, material, dimensions, targets }, currentProject ? currentProjectId : undefined) }
  return <>
    <div className="studio-top"><PageIntro page="studio" eyebrow="VEHICLE STUDIO Â· CONFIGURATION 01" title={<>Build &amp; configure<br /><span className="gradient-text">your vehicle.</span></>} description="Shape a concept around your target, preview the selected architecture and keep decisions attached to the project." action={<><Button onClick={() => setWizard(true)} icon={<Plus size={16} />}>New project</Button><Button variant="secondary" onClick={() => navigate('simulation')} icon={<Wind size={15} />}>Start simulation</Button></>} /><div className="studio-scene-shell"><div className="scene-ring scene-ring-a" /><div className="scene-ring scene-ring-b" /><StudioVehiclePreview body={body} /><div className="scene-label">01 / VEHICLE PREVIEW <span>{body.toUpperCase()}</span></div></div></div>
    <div className="studio-grid"><Panel className="config-panel"><div className="panel-heading"><div><span className="eyebrow small-eyebrow">PROJECT CONFIGURATION</span><h2>Design parameters</h2></div><span className="saved-state"><span className="live-dot" /> LOCAL DRAFT</span></div><label className="field-label">Project name<input value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Aero Concept 02" /></label><label className="field-label">Short description<textarea value={description} onChange={event => setDescription(event.target.value)} rows={2} placeholder="What are you designing?" /></label><div className="field-row"><label className="field-label">Vehicle type<select value={body} onChange={event => setBody(event.target.value)}>{['Sports Coupe', 'SUV', 'Sedan', 'Hatchback', 'Concept'].map(option => <option key={option}>{option}</option>)}</select></label><label className="field-label">Powertrain<select value={powertrain} onChange={event => setPowertrain(event.target.value)}>{['Electric', 'Hybrid', 'Conventional'].map(option => <option key={option}>{option}</option>)}</select></label></div><label className="field-label">Primary material<select value={material} onChange={event => setMaterial(event.target.value)}>{['Carbon Fiber', 'Aluminium Alloy', 'Titanium Alloy', 'Magnesium Alloy', 'High-Strength Steel'].map(option => <option key={option}>{option}</option>)}</select></label><SectionTitle title="Vehicle dimensions" /><div className="range-fields">{(['length', 'width', 'height'] as const).map(key => <label key={key}><span>{key}<b>{dimensions[key].toFixed(1)} m</b></span><input type="range" min={key === 'length' ? 3.7 : 1.3} max={key === 'length' ? 5.4 : key === 'width' ? 2.4 : 2} step="0.1" value={dimensions[key]} onChange={event => setDimensions(old => ({ ...old, [key]: Number(event.target.value) }))} /></label>)}</div><div className="panel-actions"><Button variant="secondary" onClick={() => { setName(currentProject?.name ?? ''); setDescription(currentProject?.description ?? ''); setBody(currentProject?.body ?? 'Sports Coupe'); setPowertrain(currentProject?.powertrain ?? 'Electric'); setMaterial(currentProject?.material ?? 'Carbon Fiber'); setDimensions(currentProject?.dimensions ?? { length: 4.5, width: 1.9, height: 1.4 }); setTargets(currentProject?.targets ?? { range: 450, battery: 82, drag: 0.26 }); notify('Reverted to the last saved project') }} icon={<RotateCcw size={15} />}>Revert</Button><Button onClick={onSave} icon={<Save size={15} />}>Save project</Button></div></Panel><div className="studio-side-stack"><Panel><SectionTitle eyebrow="BUILD OPTIONS" title="Choose an architecture" /><div className="choice-grid">{['Sports Coupe', 'SUV', 'Sedan', 'Hatchback', 'Concept'].map(item => <button key={item} className={`choice-card ${body === item ? 'choice-selected' : ''}`} onClick={() => setBody(item)} aria-pressed={body === item}><VehicleAssetImage body={item} className="choice-vehicle-image" /><b>{item}</b><small>{body === item ? 'Selected' : 'Choose type'}</small></button>)}</div></Panel><Panel><SectionTitle eyebrow="SELECTED COMPONENTS" title={`Configuration Â· ${currentProject?.selectedComponents?.length ?? 0}`} action={<button className="text-button" onClick={() => navigate('library')}>Browse library <ArrowRight size={14} /></button>} />{currentProject?.selectedComponents?.length ? <div className="selected-components">{currentProject.selectedComponents.map(item => <span key={item} className="selected-component-item"><Settings2 size={13} /><span>{item}</span><button type="button" aria-label={`Remove ${item}`} title={`Remove ${item}`} onClick={() => { const at = new Date().toISOString().slice(0, 10); setProjects(old => old.map(project => project.id === currentProjectId ? removeProjectComponent(project, item, at).project : project)); notify(`${item} removed from the active project`) }}><X size={13} /></button></span>)}</div> : <p className="muted">No components added yet. Browse the library to build out this concept.</p>}</Panel><Panel><SectionTitle eyebrow="DESIGN HISTORY" title={"Saved versions â€¢ " + (currentProject?.versions?.length ?? 0)} />{currentProject?.versions?.length ? currentProject.versions.slice().reverse().slice(0, 5).map(version => <div className="setting-row" key={version.number}><div><b>Version {version.number} â€¢ {version.name}</b><small>{version.savedAt} â€¢ {version.body} â€¢ {version.powertrain} â€¢ {version.material}</small></div></div>) : <p className="muted">Save this project again to create its first configuration snapshot.</p>}</Panel><Panel><SectionTitle eyebrow="TARGETS" title="Performance intent" /><div className="target-list"><label className="field-label">Range target <b>{targets.range} km</b><input type="range" min="200" max="800" step="10" value={targets.range} onChange={event => setTargets(value => ({ ...value, range: Number(event.target.value) }))} /></label><label className="field-label">Battery target <b>{targets.battery} kWh</b><input type="range" min="30" max="160" step="2" value={targets.battery} onChange={event => setTargets(value => ({ ...value, battery: Number(event.target.value) }))} /></label><label className="field-label">Drag target <b>â‰¤ {targets.drag.toFixed(2)}</b><input type="range" min="0.18" max="0.4" step="0.01" value={targets.drag} onChange={event => setTargets(value => ({ ...value, drag: Number(event.target.value) }))} /></label></div><p className="data-note">Targets are editable planning inputs, not guaranteed outcomes.</p></Panel></div></div>
    {wizard && <Modal title="Create a vehicle project" close={() => setWizard(false)}><p className="muted">Start with a clean project or carry over the current setup.</p><div className="wizard-options"><button onClick={() => { setName('New vehicle concept'); setDescription(''); setBody('Concept'); setPowertrain('Electric'); setWizard(false); notify('Blank concept ready to configure') }}><span>ï¼‹</span><b>Start from scratch</b><small>Choose every system yourself.</small></button><button onClick={() => { setName('EV performance study'); setDescription('Electric performance concept based on the demo template.'); setBody('Sports Coupe'); setPowertrain('Electric'); setWizard(false); notify('EV performance template loaded') }}><span>âœ§</span><b>EV performance</b><small>Begin with a sports coupe template.</small></button></div><Button variant="quiet" onClick={() => setWizard(false)}>Cancel</Button></Modal>}
  </>
}

function Modal({ title, children, close }: { title: string; children: React.ReactNode; close: () => void }) { return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close() }}><motion.div className="modal panel" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={close}><X size={18} /></button></div>{children}</motion.div></div> }

const simulationVehicleAssets: Record<string, { src: string; alt: string }> = {
  'Sports Coupe': { src: assetUrl('/images/vehicles/veytrix-coupe-render.png'), alt: 'VEYTRIX electric sports coupe in a cinematic showroom' },
  SUV: { src: assetUrl('/images/vehicles/veytrix-suv-render.png'), alt: 'VEYTRIX electric SUV in a cinematic showroom' },
  Sedan: { src: assetUrl('/images/vehicles/veytrix-sedan-render.png'), alt: 'VEYTRIX electric sedan in a cinematic showroom' },
  Hatchback: { src: assetUrl('/images/vehicles/veytrix-hatch-render.png'), alt: 'VEYTRIX electric hatchback in a cinematic showroom' },
  Concept: { src: assetUrl('/images/vehicles/veytrix-concept-render.png'), alt: 'VEYTRIX electric concept vehicle in a cinematic showroom' },
}

function SimulationVehiclePreview({ body }: { body?: string }) {
  const vehicle = simulationVehicleAssets[body ?? 'Sports Coupe'] ?? simulationVehicleAssets['Sports Coupe']
  return <div className="simulation-vehicle" key={vehicle.src}><img src={vehicle.src} alt={vehicle.alt} decoding="async" fetchPriority="high" /></div>
}

function AirflowVisualization() {
  return <svg className="airflow-visualization" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-label="Illustrative airflow streamlines around the selected vehicle">
    <defs>
      <linearGradient id="airflow-cool" x1="0" x2="1"><stop stopColor="#08cfff" stopOpacity=".12"/><stop offset=".48" stopColor="#33dfff"/><stop offset="1" stopColor="#377cff" stopOpacity=".2"/></linearGradient>
      <linearGradient id="airflow-pressure" x1="0" x2="1"><stop stopColor="#745bff" stopOpacity=".1"/><stop offset=".5" stopColor="#bd5dff"/><stop offset="1" stopColor="#e74fd1" stopOpacity=".18"/></linearGradient>
      <linearGradient id="airflow-hot" x1="0" x2="1"><stop stopColor="#ff923e" stopOpacity=".15"/><stop offset=".52" stopColor="#ff5b42"/><stop offset="1" stopColor="#ffb649" stopOpacity=".18"/></linearGradient>
      <marker id="airflow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#63dfff"/></marker>
    </defs>
    <g className="airflow-lines airflow-lines-cool" fill="none" stroke="url(#airflow-cool)" strokeWidth="2" strokeDasharray="12 13" markerEnd="url(#airflow-arrow)">
      <path d="M0 142 C190 142 238 168 340 178 S650 170 1000 116"/><path d="M0 190 C190 190 232 198 330 205 S665 204 1000 183"/><path d="M0 334 C190 334 232 322 330 315 S672 322 1000 365"/><path d="M0 380 C185 380 235 354 345 346 S670 362 1000 420"/>
    </g>
    <g className="airflow-lines airflow-lines-pressure" fill="none" stroke="url(#airflow-pressure)" strokeWidth="2" strokeDasharray="9 15">
      <path d="M0 105 C260 112 266 154 360 161 S683 140 1000 88"/><path d="M0 416 C242 406 274 365 366 356 S693 388 1000 446"/>
    </g>
    <g className="airflow-lines airflow-lines-hot" fill="none" stroke="url(#airflow-hot)" strokeWidth="3" strokeDasharray="8 16">
      <path d="M0 232 C230 230 260 225 350 226 S700 240 1000 225"/><path d="M0 286 C235 286 270 292 358 291 S700 278 1000 296"/>
    </g>
    <text x="5%" y="48%" className="airflow-direction">FLOW DIRECTION</text>
  </svg>
}

export function SimulationPage({ currentProject, currentProjectId, setProjects, notify, recordSimulation }: Props) {
  const [module, setModule] = useState<SimulationType>('Aerodynamics')
  const [parameters, setParameters] = useState<SimulationConfigurations>(() => createSimulationDefaults(currentProject))
  const [baselineParameters, setBaselineParameters] = useState<SimulationConfigurations>(() => currentProject?.simulationSettings ?? createSimulationDefaults(currentProject))
  const [compareByModule, setCompareByModule] = useState<Record<SimulationType, boolean>>({
    Aerodynamics: false, 'Thermal Analysis': false, 'Structural Analysis': false,
    'Vehicle Dynamics': false, Performance: false, 'Energy & Range': false,
  })
  const [runningByModule, setRunningByModule] = useState<Partial<Record<SimulationType, boolean>>>({})
  const [progressByModule, setProgressByModule] = useState<Partial<Record<SimulationType, number>>>({})
  const [resultsByModule, setResultsByModule] = useState<Partial<Record<SimulationType, { inputs: Record<string, number | string>; calculation: SimulationCalculation; selectedComponents: string[] }>>>({})
  const modules = [
    { label: 'Aerodynamics' as const, icon: Wind },
    { label: 'Thermal Analysis' as const, icon: Thermometer },
    { label: 'Structural Analysis' as const, icon: Layers3 },
    { label: 'Vehicle Dynamics' as const, icon: Gauge },
    { label: 'Performance' as const, icon: ArrowUpRight },
    { label: 'Energy & Range' as const, icon: Battery },
  ]
  const activeParameters = parameters[module] as unknown as Record<string, number | string>
  const activeRun = resultsByModule[module]
  const isResultStale = Boolean(activeRun && (JSON.stringify(activeRun.inputs) !== JSON.stringify(activeParameters) || JSON.stringify(activeRun.selectedComponents) !== JSON.stringify(currentProject?.selectedComponents ?? [])))
  const baselineCalculation = compareByModule[module] ? calculateSimulationForType(module, baselineParameters) : undefined

  useEffect(() => {
    const saved = currentProject?.simulationSettings ?? createSimulationDefaults(currentProject)
    setParameters(saved)
    setBaselineParameters(saved)
    setResultsByModule({})
  }, [currentProjectId])

  const changeParameter = (key: string, value: number | string) => {
    const next = { ...parameters, [module]: { ...parameters[module], [key]: value } } as SimulationConfigurations
    setParameters(next)
    setProjects(old => old.map(project => project.id === currentProjectId ? { ...project, simulationSettings: next, updatedAt: new Date().toISOString().slice(0, 10) } : project))
  }

  const runSelectedSimulation = () => {
    const selectedModule = module
    if (runningByModule[selectedModule]) return
    const selectedConfig = { ...parameters[selectedModule] } as SimulationConfigurations[SimulationType]
    const snapshot = { ...parameters, [selectedModule]: selectedConfig } as SimulationConfigurations
    let calculation: SimulationCalculation
    try {
      calculation = calculateSimulationForType(selectedModule, snapshot)
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Check the simulation inputs and try again.')
      return
    }
    const inputSnapshot = selectedConfig as unknown as Record<string, number | string>
    const componentSnapshot = [...(currentProject?.selectedComponents ?? [])]
    setRunningByModule(previous => ({ ...previous, [selectedModule]: true }))
    setProgressByModule(previous => ({ ...previous, [selectedModule]: 12 }))
    notify(`${selectedModule} estimate started`)
    window.setTimeout(() => setProgressByModule(previous => ({ ...previous, [selectedModule]: 52 })), 300)
    window.setTimeout(() => setProgressByModule(previous => ({ ...previous, [selectedModule]: 82 })), 700)
    window.setTimeout(() => {
      setProgressByModule(previous => ({ ...previous, [selectedModule]: 100 }))
      setRunningByModule(previous => ({ ...previous, [selectedModule]: false }))
      setResultsByModule(previous => ({ ...previous, [selectedModule]: { inputs: inputSnapshot, calculation, selectedComponents: componentSnapshot } }))
      recordSimulation(selectedModule, { calculationVersion: calculation.calculationVersion, inputs: inputSnapshot, assumptions: calculation.assumptions, selectedComponents: componentSnapshot })
    }, 1100)
  }

  const formatValue = (value: number | string) => typeof value === 'number'
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : value
  const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

  return <>
    <PageIntro page="simulation" title={<>Run a virtual<br /><span className="gradient-text">test session.</span></>} description={`Configure ${module.toLowerCase()} for ${currentProject?.name ?? 'your vehicle project'}. Each mode has independent inputs and its own transparent concept calculation.`} action={<DemoFlag children="ESTIMATES Â· NOT VALIDATED" />} />
    <div className="simulation-layout">
      <div className="simulation-stage">
        <div className="stage-topline"><span className="eyebrow small-eyebrow">VIRTUAL TEST FACILITY</span><span className="stage-project">{currentProject?.name ?? 'No current project'}</span></div>
        <div className="air-visual">
          <div className="wind-tunnel-grid" aria-hidden="true"/><div className="wind-tunnel-glow" aria-hidden="true"/>
          {module === 'Aerodynamics' && <AirflowVisualization />}
          {module !== 'Aerodynamics' && <div className={`simulation-domain-visual domain-${module.replace(/[^a-z]/gi, '').toLowerCase()}`} aria-hidden="true"><span>{module.toUpperCase()} Â· CONCEPT VIEW</span><i/><i/><i/></div>}
          <SimulationVehiclePreview body={currentProject?.body}/>
          <div className="sim-overlay sim-overlay-left"><span>ACTIVE CONFIGURATION</span><b>{module}</b></div>
          <div className="sim-overlay sim-overlay-right"><span>RESULT STATUS</span><b>{runningByModule[module] ? 'RUNNING' : activeRun ? (isResultStale ? 'RERUN NEEDED' : activeRun.calculation.status.toUpperCase()) : 'AWAITING RUN'}</b></div>
          {module === 'Aerodynamics' && <div className="airflow-legend"><strong>ILLUSTRATIVE AIRFLOW</strong><span><i className="legend-flow-cyan"/> Nominal flow</span><span><i className="legend-flow-violet"/> Pressure variation</span><span><i className="legend-flow-orange"/> High intensity</span></div>}
          <span className="vehicle-config-tag">{currentProject?.body ?? 'Sports Coupe'} <b>|</b> STATIC PREVIEW</span>
        </div>
        <div className="simulation-footer"><DemoFlag children="SIMPLIFIED ESTIMATES / NO CFD OR FEA SOLVER"/><span>Vehicle project configuration is unchanged by simulation runs.</span></div>
      </div>
      <aside className="simulation-controls panel">
        <div className="panel-heading"><div><span className="eyebrow small-eyebrow">SIMULATION WORKSPACE</span><h2>Run configuration</h2></div><Settings2 size={18}/></div>
        <div className="module-tabs" role="tablist" aria-label="Simulation types">{modules.map(({ label, icon: Icon }) => <button type="button" role="tab" aria-selected={module === label} key={label} className={module === label ? 'active' : ''} onClick={() => setModule(label)}><Icon size={15}/><span>{label}</span><ChevronRight size={14}/></button>)}</div>
        <div className="simulation-parameter-heading"><span className="eyebrow small-eyebrow">{module.toUpperCase()} INPUTS</span><span>Independent configuration</span></div>
        <div className="simulation-component-context"><Settings2 size={13}/><span>Project configuration attached</span><b>{currentProject?.selectedComponents?.length ?? 0} components</b></div>
        <div className="simulation-parameter-grid">{simulationFields[module].map(field => {
          const value = activeParameters[field.key]
          return <label className="simulation-parameter" key={field.key}>
            <span>{field.label}{field.unit && <small>{field.unit}</small>}</span>
            {field.options
              ? <select value={String(value)} disabled={Boolean(runningByModule[module])} onChange={event => changeParameter(field.key, event.target.value)}>{field.options.map(option => <option key={option} value={option}>{option}</option>)}</select>
              : <input type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step} value={String(value)} disabled={Boolean(runningByModule[module])} onChange={event => changeParameter(field.key, Number(event.target.value))}/>}
          </label>
        })}</div>
        <label className="toggle-row"><span>Compare with baseline</span><input type="checkbox" checked={compareByModule[module]} onChange={event => setCompareByModule(previous => ({ ...previous, [module]: event.target.checked }))}/><i/></label>
        <Button onClick={runSelectedSimulation} disabled={Boolean(runningByModule[module])} icon={<Wind size={16}/>}>{runningByModule[module] ? 'Calculating estimateâ€¦' : 'Run Simulation'}</Button>
        <div className="progress-track"><span style={{ width: `${progressByModule[module] ?? 0}%` }}/></div>
        <small className="data-note">Concept calculations only. Results are estimates and are not engineering validation or safety evidence.</small>
      </aside>
    </div>
    <div className="results-heading"><SectionTitle eyebrow={activeRun && !isResultStale ? 'LATEST ESTIMATE' : 'MODE-SPECIFIC RESULTS'} title={`${module} results`}/><span className="status-chip status-estimated">{activeRun ? (isResultStale ? 'INPUTS CHANGED Â· RERUN' : activeRun.calculation.status.toUpperCase()) : 'AWAITING RUN'}</span></div>
    <div className="simulation-results"><Panel className="simulation-result-panel">
      {!activeRun && <p className="simulation-result-empty">Set this modeâ€™s parameters and run the estimate to see its relevant engineering metrics and assumptions.</p>}
      {activeRun && <>
        {isResultStale && <p className="simulation-stale-note">Parameters have changed since the last run. Results below show that saved run; run again to calculate the current inputs.</p>}
        <div className="simulation-metric-grid">{activeRun.calculation.metrics.map(metric => {
          const baselineMetric = baselineCalculation?.metrics.find(candidate => candidate.label === metric.label)
          const metricDelta = typeof metric.value === 'number' && typeof baselineMetric?.value === 'number' ? metric.value - baselineMetric.value : undefined
          return <div className="simulation-metric" key={metric.label}><span>{metric.label}</span><b>{formatValue(metric.value)} <small>{metric.unit}</small></b>{compareByModule[module] && baselineMetric && <small className="simulation-baseline">Baseline {formatValue(baselineMetric.value)} {baselineMetric.unit}{typeof metricDelta === 'number' && <em> Â· Î” {formatDelta(metricDelta)} {metric.unit}</em>}</small>}</div>
        })}</div>
        <div className="simulation-assumptions"><span className="eyebrow small-eyebrow">CALCULATION ASSUMPTIONS Â· {activeRun.calculation.calculationVersion}</span><ul>{activeRun.calculation.assumptions.map(assumption => <li key={assumption}>{assumption}</li>)}</ul></div>
        <div className="simulation-component-snapshot"><span className="eyebrow small-eyebrow">PROJECT COMPONENTS AT RUN TIME · {activeRun.selectedComponents.length}</span><p>{activeRun.selectedComponents.length ? activeRun.selectedComponents.join(' · ') : 'No components selected for this project.'}</p></div>
      </>}
    </Panel></div>
  </>
}
export function LibraryPage({ navigate, notify, currentProjectId, setProjects, currentProject }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All systems')
  const [selected, setSelected] = useState(components[0].name)
  const [compare, setCompare] = useState<string[]>([])
  const categories = ['All systems', ...Array.from(new Set(components.map(item => item.category)))]
  const filtered = components.filter(item => (category === 'All systems' || item.category === category) && `${item.name} ${item.category} ${item.fit}`.toLowerCase().includes(query.toLowerCase()))
  const selectedItem = components.find(item => item.name === selected) ?? filtered[0]
  const alreadyAdded = Boolean(selectedItem && currentProject?.selectedComponents?.includes(selectedItem.name))
  const toggleCompare = (name: string) => setCompare(old => old.includes(name) ? old.filter(item => item !== name) : old.length < 3 ? [...old, name] : old)
  return <><PageIntro page="library" title={<>Explore the<br /><span className="gradient-text">component library.</span></>} description="Browse configurable demonstration components with specifications, fit notes and cost estimates. Add a candidate to your current project." action={<DemoFlag children="SAMPLE COMPONENT CATALOG" />} />
    <div className="library-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search components, systems, fitâ€¦" /></label><label className="select-field"><SlidersHorizontal size={15} /><select value={category} onChange={event => setCategory(event.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select></label><span className="result-count">{filtered.length} components</span></div>
    <div className="library-layout"><div className="component-list">{filtered.map(item => <div className={`component-row ${selected === item.name ? 'selected' : ''}`} key={item.name}><button type="button" className="component-row-select" aria-pressed={selected === item.name} onClick={() => setSelected(item.name)}><span className="component-thumbnail"><img src={item.image} alt={`${item.name} component illustration`} width="356" height="240" loading="lazy" decoding="async" onError={() => { if (import.meta.env.DEV) console.warn(`Missing component library image: ${item.image}`) }} /></span><span className="component-row-copy"><span className="eyebrow small-eyebrow">{item.category}</span><b>{item.name}</b><small>{item.fit}</small></span></button><button type="button" className={`compare-check ${compare.includes(item.name) ? 'checked' : ''}`} aria-label={`Compare ${item.name}`} aria-pressed={compare.includes(item.name)} onClick={() => toggleCompare(item.name)}>{compare.includes(item.name) && <Check size={13} />}</button><ChevronRight className="row-chevron" size={17} /></div>)}{filtered.length === 0 && <EmptyState title="No matching components" body="Try another search or choose a different system." />}</div>
      <Panel className="component-detail">{selectedItem ? <><div className="component-detail-art"><div className="component-halo"/><img className="component-detail-image" key={selectedItem.image} src={selectedItem.image} alt={`${selectedItem.name} engineering illustration`} width="356" height="240" decoding="async" onError={() => { if (import.meta.env.DEV) console.warn(`Missing component library image: ${selectedItem.image}`) }} /><span className="detail-serial">VX / {String(components.indexOf(selectedItem) + 1).padStart(3, '0')}</span></div><div className="component-detail-body"><div className="detail-title-row"><div><span className="eyebrow small-eyebrow">{selectedItem.category} Â· DEMO LIBRARY</span><h2>{selectedItem.name}</h2></div><span className="availability"><i /> Available</span></div><p className="muted">Illustrative component render for interface exploration. Confirm supplier data and fit before applying a real part.</p><div className="spec-grid"><div><span>Power / rating</span><b>{selectedItem.power}</b></div><div><span>Peak torque</span><b>{selectedItem.torque}</b></div><div><span>Mass</span><b>{selectedItem.weight}</b></div><div><span>Cost estimate</span><b>{selectedItem.cost}</b></div></div><div className="compatibility"><span className="eyebrow small-eyebrow">COMPATIBILITY NOTES</span><p>{selectedItem.fit}</p></div><div className="panel-actions"><Button disabled={alreadyAdded} onClick={() => { const at = new Date().toISOString().slice(0, 10); setProjects(old => old.map(project => project.id === currentProjectId ? addProjectComponent(project, selectedItem.name, at).project : project)); navigate('studio'); notify(`${selectedItem.name} added to the active project`) }} icon={<Plus size={16} />}>{alreadyAdded ? 'Already in project' : 'Add to project'}</Button><Button variant="secondary" onClick={() => toggleCompare(selectedItem.name)}>{compare.includes(selectedItem.name) ? 'Remove compare' : 'Add to compare'}</Button></div></div></> : <EmptyState title="Select a component" body="Choose a library entry to see its specifications." />}</Panel></div>
    {compare.length > 0 && <Panel className="compare-panel"><div className="panel-heading"><div><span className="eyebrow small-eyebrow">SIDE BY SIDE</span><h2>Compare components <span className="muted">({compare.length}/3)</span></h2></div><button className="text-button" onClick={() => setCompare([])}>Clear all <X size={14} /></button></div><div className="compare-table"><div className="compare-table-head"><span>Specification</span>{compare.map(name => <b key={name}>{name}</b>)}</div>{[['Power / rating', 'power'], ['Peak torque', 'torque'], ['Mass', 'weight'], ['Cost estimate', 'cost']].map(([label, key]) => <div className="compare-table-row" key={key}><span>{label}</span>{compare.map(name => <b key={name}>{components.find(item => item.name === name)?.[key as keyof typeof components[number]]}</b>)}</div>)}</div></Panel>}
  </>
}

export function MaterialsPage({ currentProject, currentProjectId, notify, setProjects }: Props) {
  const [selected, setSelected] = useState<string[]>([materials[0].short, materials[1].short])
  const [focus, setFocus] = useState(materials[0].short)
  const [lens, setLens] = useState('All properties')
  const selectedMaterials = materials.filter(item => selected.includes(item.short))
  const focusMaterial = materials.find(item => item.short === focus) ?? materials[0]
  const visibleMaterials = materials.filter(item => lens === 'Lightweight candidates' ? item.density <= 2.8 : lens === 'High strength candidates' ? item.strength >= 570 : lens === 'Thermal candidates' ? item.thermal >= 45 : true)
  const toggle = (name: string) => setSelected(old => old.includes(name) ? old.length > 1 ? old.filter(item => item !== name) : old : old.length < 3 ? [...old, name] : old)
  const propRows = [{ key: 'density', label: 'Density', unit: 'g/cmÂ³', better: 'lower' }, { key: 'strength', label: 'Tensile strength', unit: 'MPa', better: 'higher' }, { key: 'modulus', label: "Young's modulus", unit: 'GPa', better: 'higher' }, { key: 'thermal', label: 'Thermal conductivity', unit: 'W/mÂ·K', better: 'higher' }, { key: 'cost', label: 'Relative cost', unit: '$/kg index', better: 'lower' }] as const
  return <><PageIntro page="materials" title={<>Materials shape<br /><span className="gradient-text">every decision.</span></>} description={`Compare candidates for ${currentProject?.name ?? 'your vehicle project'}. Values below are typical indicative references for concept-stage exploration, not supplier-certified specifications.`} action={<DemoFlag children="INDICATIVE REFERENCE DATA" />} />
    <div className="material-layout"><Panel className="material-picker"><SectionTitle eyebrow="MATERIAL CATALOG" title="Candidate materials" /><label className="select-field material-lens"><SlidersHorizontal size={15} /><select value={lens} onChange={event => setLens(event.target.value)}><option>All properties</option><option>Lightweight candidates</option><option>High strength candidates</option><option>Thermal candidates</option></select></label><div className="material-list">{visibleMaterials.map(item => <button key={item.short} className={`material-option ${focus === item.short ? 'focused' : ''}`} onClick={() => setFocus(item.short)}><MaterialSwatch color={item.color} name={item.name} /><span><b>{item.short}</b><small>{item.use}</small></span><input type="checkbox" checked={selected.includes(item.short)} onChange={() => toggle(item.short)} aria-label={`Compare ${item.short}`} /></button>)}</div><div className="material-recommend"><Sparkles size={17} /><div><b>Concept-stage suggestion</b><p>{lens === 'Lightweight candidates' ? 'Carbon fiber and magnesium are lower-density candidates in this sample set.' : `${focusMaterial.short} is listed for ${focusMaterial.use.toLowerCase()}. Check process, joining and lifecycle constraints.`}</p></div></div><Button onClick={() => { setProjects(old => old.map(project => project.id === currentProjectId ? { ...project, material: focusMaterial.short, materialHistory: [...(project.materialHistory ?? []), { name: focusMaterial.short, at: new Date().toISOString().slice(0, 10) }], updatedAt: new Date().toISOString().slice(0, 10) } : project)); notify(`${focusMaterial.short} selected for the active project`) }} icon={<Check size={15} />}>Select for project</Button></Panel>
      <div className="material-main"><Panel className="material-hero"><div className="material-hero-copy"><span className="eyebrow small-eyebrow">MATERIAL SAMPLE Â· {focusMaterial.short.toUpperCase()}</span><h2>{focusMaterial.name}</h2><p>{focusMaterial.use}</p><DemoFlag children="TYPICAL REFERENCE VALUES" /></div><div className="material-object"><div className="material-object-glow"/><div className="material-plate plate-one" style={{ '--plate': focusMaterial.color } as React.CSSProperties} /><div className="material-plate plate-two" /><div className="material-plate plate-three" /></div></Panel><Panel className="comparison-panel"><div className="panel-heading"><div><span className="eyebrow small-eyebrow">PROPERTY COMPARISON</span><h2>Compare selected materials</h2></div><span className="muted">Select up to 3</span></div><div className="property-table"><div className="property-row property-header"><span>Property</span>{selectedMaterials.map(item => <b key={item.short}><MaterialSwatch color={item.color} name={item.short} />{item.short}</b>)}</div>{propRows.map(row => { const values = selectedMaterials.map(item => Number(item[row.key])); const best = row.better === 'lower' ? Math.min(...values) : Math.max(...values); return <div className="property-row" key={row.key}><span>{row.label}<small>{row.unit}</small></span>{selectedMaterials.map(item => <b key={item.short} className={Number(item[row.key]) === best ? 'best-value' : ''}>{item[row.key]}{Number(item[row.key]) === best && <Check size={13} />}</b>)}</div> })}<div className="property-row"><span>Common application</span>{selectedMaterials.map(item => <b className="use-value" key={item.short}>{item.use}</b>)}</div></div><p className="data-note">Values are indicative material-class references. Verify alloy, temper, layup, manufacturing method and supplier data for real designs.</p></Panel></div></div>
  </>
}

export function OptimizationPage({ currentProject, currentProjectId, notify, setProjects }: Props) {
  const [objectives, setObjectives] = useState(currentProject?.optimizationSettings?.objectives ?? ['Reduce mass', 'Increase range'])
  const [massLimit, setMassLimit] = useState(currentProject?.optimizationSettings?.massLimit ?? 15)
  const [costLimit, setCostLimit] = useState(currentProject?.optimizationSettings?.costLimit ?? 8)
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    const saved = currentProject?.optimizationSettings
    setObjectives(saved?.objectives ?? ['Reduce mass', 'Increase range'])
    setMassLimit(saved?.massLimit ?? 15)
    setCostLimit(saved?.costLimit ?? 8)
    setComplete(false)
  }, [currentProjectId])
  const persistOptimizationSettings = (update: Partial<{ objectives: string[]; massLimit: number; costLimit: number }>) => setProjects(old => old.map(project => project.id === currentProjectId ? { ...project, optimizationSettings: { objectives: [...(project.optimizationSettings?.objectives ?? objectives)], massLimit: project.optimizationSettings?.massLimit ?? massLimit, costLimit: project.optimizationSettings?.costLimit ?? costLimit, ...update }, updatedAt: new Date().toISOString().slice(0, 10) } : project))
  const toggle = (option: string) => { const next = objectives.includes(option) ? objectives.filter(item => item !== option) : [...objectives, option]; setObjectives(next); persistOptimizationSettings({ objectives: next }) }
  const recommendedMaterial = objectives.includes('Reduce mass') ? 'Carbon Fiber' : objectives.includes('Reduce material cost') ? 'High-Strength Steel' : 'Aluminium Alloy'
  const vehicleBody = currentProject?.body ?? 'Sports Coupe'
  const rangeTarget = currentProject?.targets?.range
  return <><PageIntro page="optimization" title={<>Explore a better<br /><span className="gradient-text">design balance.</span></>} description={`Set objectives for ${currentProject?.name ?? 'your current project'} and review a qualitative material suggestion.`} action={<DemoFlag children="QUALITATIVE SUGGESTION" />} />
    <div className="optimization-layout"><Panel className="optimization-inputs"><SectionTitle eyebrow="DESIGN OBJECTIVES" title="What matters most?" /><p className="muted">Choose priorities for a qualitative material suggestion. The prototype does not calculate engineering deltas.</p><div className="objective-list">{[{ name: 'Reduce mass', detail: 'Lower vehicle curb weight', icon: ArrowDownRight }, { name: 'Increase range', detail: 'Reduce energy use per distance', icon: Battery }, { name: 'Improve performance', detail: 'Increase power-to-mass balance', icon: Gauge }, { name: 'Reduce material cost', detail: 'Explore lower-cost substitutions', icon: Layers3 }, { name: 'Thermal robustness', detail: 'Improve thermal headroom', icon: Thermometer }].map(({ name, detail, icon: Icon }) => <label className={`objective-option ${objectives.includes(name) ? 'chosen' : ''}`} key={name}><input type="checkbox" checked={objectives.includes(name)} onChange={() => toggle(name)} /><span className="objective-check"><Check size={12} /></span><Icon size={17} /><span><b>{name}</b><small>{detail}</small></span></label>)}</div><div className="control-slider"><div><span>Maximum mass reduction preference</span><b>{massLimit}%</b></div><input type="range" min="0" max="30" step="1" value={massLimit} onChange={event => { const next = Number(event.target.value); setMassLimit(next); persistOptimizationSettings({ massLimit: next }) }} /></div><div className="control-slider"><div><span>Cost increase tolerance preference</span><b>{costLimit}%</b></div><input type="range" min="0" max="25" step="1" value={costLimit} onChange={event => { const next = Number(event.target.value); setCostLimit(next); persistOptimizationSettings({ costLimit: next }) }} /></div><Button disabled={objectives.length === 0} onClick={() => { setComplete(true); notify('Qualitative material suggestion generated; performance values are not calculated') }} icon={<Sparkles size={15} />}>Generate recommendation</Button></Panel>
      <div className="optimization-output"><Panel className="before-after"><div className="panel-heading"><div><span className="eyebrow small-eyebrow">CONFIGURATION EXPLORER</span><h2>{complete ? 'Suggested material study' : 'Current vs. candidate'}</h2></div><DemoFlag children="NOT A SOLVER RESULT" /></div><div className="compare-vehicles"><div className="compare-vehicle"><div className="compare-vehicle-art current-car"><VehicleAssetImage body={vehicleBody} className="optimization-vehicle-image" /></div><span className="eyebrow small-eyebrow">CURRENT CONFIGURATION</span><b>{currentProject?.name ?? 'Concept vehicle'}</b><span>{vehicleBody} · {currentProject?.powertrain ?? 'Powertrain not set'} · {currentProject?.material ?? 'Material not set'}</span></div><div className="compare-arrow"><ArrowRight /></div><div className="compare-vehicle recommended"><div className="compare-vehicle-art candidate-car"><VehicleAssetImage body={vehicleBody} className="optimization-vehicle-image" /></div><span className="eyebrow small-eyebrow">CANDIDATE CONFIGURATION</span><b>{complete ? 'Material suggestion' : 'Candidate study'}</b><span>{vehicleBody} · Suggested material: {complete ? recommendedMaterial : 'Not calculated'}</span></div></div><div className="optimization-comparison" aria-label="Current and candidate configuration comparison"><div className="optimization-comparison-head"><span>Comparison</span><b>Current</b><b>Candidate</b></div><div><span>Vehicle mass</span><b>Not calculated</b><b>Not calculated</b></div><div><span>Estimated driving range</span><b>Not calculated</b><b>Not calculated</b></div><div><span>Estimated cost</span><b>Not calculated</b><b>Not calculated</b></div><div><span>Range target</span><b>{rangeTarget ? `${rangeTarget} km target` : '—'}</b><b>{rangeTarget ? `${rangeTarget} km target` : '—'}</b></div><div><span>Selected objectives</span><b>{objectives.length ? objectives.join(', ') : 'None selected'}</b><b>{objectives.length ? objectives.join(', ') : 'None selected'}</b></div></div><div className="recommendation-note"><Sparkles size={17} /><span>{complete ? `Qualitative material suggestion based on: ${objectives.join(', ').toLowerCase()}. No validated or calculated performance deltas are available.` : 'Generate a qualitative material suggestion. Vehicle mass, cost and estimated range are not available in project data.'}</span></div>{complete && <Button variant="secondary" onClick={() => { setProjects(old => old.map(project => project.id === currentProjectId ? { ...project, material: recommendedMaterial, updatedAt: new Date().toISOString().slice(0, 10) } : project)); notify(`Suggested material ${recommendedMaterial} applied to project`) }} icon={<Check size={15} />}>Apply candidate material · {recommendedMaterial}</Button>}</Panel><div className="stat-grid optimization-stats"><StatCard label="Mass Change" value="—" unit="Not calculated" icon={ArrowDownRight} color="cyan" /><StatCard label="Range Change" value="—" unit="Not calculated" icon={Battery} color="violet" /><StatCard label="Cost Change" value="—" unit="Not calculated" icon={Layers3} color="orange" /><StatCard label="Objectives" value={objectives.length} unit="selected" icon={Check} color="green" /></div><Panel className="optimization-envelope"><SectionTitle eyebrow="TRADE-OFF VIEW" title="Candidate performance envelope" /><div className="optimization-chart-frame"><div className="optimization-y-label">Estimated range (km)</div><div className="optimization-plot"><span className="optimization-x-label">Vehicle mass (kg)</span><div className="optimization-chart-empty">No calculated performance data available</div></div></div><div className="optimization-chart-legend"><span><i className="current-legend" />Current configuration</span><span><i className="candidate-legend" />Candidate configuration</span></div><p className="optimization-chart-note">No mass or range calculations are available to plot. The axes are labeled for future calculated results; no performance curve is fabricated.</p></Panel></div></div>
  </>
}

export function AnalyticsPage({ currentProject, navigate }: Props) {
  const [period, setPeriod] = useState('Last 6 months')
  const [compare, setCompare] = useState(false)
  const energy = [{ name: 'Dec', use: 21.4, baseline: 23.2, mass: 1754 }, { name: 'Jan', use: 21.0, baseline: 23.0, mass: 1748 }, { name: 'Feb', use: 20.8, baseline: 22.8, mass: 1740 }, { name: 'Mar', use: 20.5, baseline: 22.7, mass: 1735 }, { name: 'Apr', use: 20.2, baseline: 22.6, mass: 1729 }, { name: 'May', use: 20.0, baseline: 22.5, mass: 1722 }, { name: 'Jun', use: 19.8, baseline: 22.4, mass: 1718 }, { name: 'Jul', use: 19.2, baseline: 22.1, mass: 1712 }, { name: 'Aug', use: 18.9, baseline: 21.8, mass: 1704 }, { name: 'Sep', use: 18.4, baseline: 21.4, mass: 1697 }, { name: 'Oct', use: 18.1, baseline: 21.2, mass: 1687 }, { name: 'Nov', use: 17.9, baseline: 20.9, mass: 1680 }]
  const visibleEnergy = period === 'Last 90 days' ? energy.slice(-3) : period === 'Last 6 months' ? energy.slice(-6) : energy
  const distribution = [{ name: 'Front', value: 47, fill: '#32d7ff' }, { name: 'Rear', value: 53, fill: '#a35bff' }]
  return <><div className="analytics-top"><PageIntro page="analytics" title={<>Understand your<br /><span className="gradient-text">vehicle signals.</span></>} description={`A demonstration performance workspace for ${currentProject?.name ?? 'your vehicle project'}. Trends are sample data for exploring the interface.`} action={<DemoFlag children="DEMONSTRATION DATA" />} /><div className="analytics-actions"><label className="select-field"><span>Period</span><select value={period} onChange={event => setPeriod(event.target.value)}><option>Last 6 months</option><option>Last 90 days</option><option>All available</option></select></label><Button variant="secondary" onClick={() => setCompare(!compare)} icon={<SlidersHorizontal size={15} />}>{compare ? 'Hide baseline' : 'Compare baseline'}</Button><Button onClick={() => navigate('reports')} icon={<FileText size={15} />}>Create report</Button></div></div>
    <div className="analytics-kpis">{demoMetrics.map(metric => <StatCard key={metric.label} label={metric.label} value={metric.value} unit={metric.unit} change={metric.trend} color={metric.color} />)}</div>
    <div className="analytics-grid"><Panel className="chart-panel chart-wide"><div className="panel-heading"><div><span className="eyebrow small-eyebrow">EFFICIENCY &amp; RANGE</span><h2>Energy consumption trend</h2></div><span className="chart-legend"><i /> Current <i className="legend-violet" /> {compare ? 'Baseline' : 'Energy use'}</span></div><div className="chart-box chart-box-large"><ResponsiveContainer width="100%" height="100%"><LineChart data={visibleEnergy}><CartesianGrid stroke="#29405a" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" stroke="#748aa4" tickLine={false} axisLine={false} /><YAxis stroke="#748aa4" tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: '#101d2c', border: '1px solid #31506c', borderRadius: 10 }} /><Line type="monotone" dataKey="use" name="Current Â· kWh/100km" stroke="#32d7ff" strokeWidth={3} dot={{ r: 3, fill: '#32d7ff' }} /><Line type="monotone" dataKey={compare ? 'baseline' : 'mass'} name={compare ? 'Baseline Â· kWh/100km' : 'Mass Â· kg'} stroke="#af5dff" strokeWidth={2} strokeDasharray={compare ? '0' : '5 5'} dot={false} /></LineChart></ResponsiveContainer></div><p className="chart-footnote">{period} Â· Illustrative project series Â· values are not measured vehicle telemetry</p></Panel>
      <Panel><div className="panel-heading"><div><span className="eyebrow small-eyebrow">VEHICLE DISTRIBUTION</span><h2>Mass balance</h2></div><CircleHelp size={16} /></div><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} innerRadius={67} outerRadius={94} dataKey="value" stroke="none" paddingAngle={4}>{distribution.map(item => <Cell key={item.name} fill={item.fill} />)}</Pie><Tooltip contentStyle={{ background: '#101d2c', border: '1px solid #31506c', borderRadius: 10 }} /></PieChart></ResponsiveContainer><div className="donut-center"><b>1,680</b><span>kg Â· demo</span></div></div><div className="distribution-list"><div><i style={{ background: '#32d7ff' }} />Front axle <b>47%</b></div><div><i style={{ background: '#a35bff' }} />Rear axle <b>53%</b></div></div></Panel>
      <Panel><div className="panel-heading"><div><span className="eyebrow small-eyebrow">CONFIGURATION HISTORY</span><h2>Mass trend</h2></div><span className="status-chip">âˆ’45 kg</span></div><div className="chart-box chart-box-medium"><ResponsiveContainer width="100%" height="100%"><AreaChart data={energy}><defs><linearGradient id="massFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9a5bff" stopOpacity={0.32} /><stop offset="100%" stopColor="#9a5bff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#29405a" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="name" stroke="#748aa4" tickLine={false} axisLine={false} /><YAxis domain={[1640, 1750]} stroke="#748aa4" tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: '#101d2c', border: '1px solid #31506c', borderRadius: 10 }} /><Area type="monotone" dataKey="mass" stroke="#af5dff" strokeWidth={2} fill="url(#massFill)" /></AreaChart></ResponsiveContainer></div></Panel>
      <Panel><div className="panel-heading"><div><span className="eyebrow small-eyebrow">PROJECT HEALTH</span><h2>Engineering indicators</h2></div><DemoFlag /></div><div className="indicator-list">{[['Thermal headroom', 76, 'cyan'], ['Range target', 82, 'violet'], ['Mass target', 68, 'orange'], ['Data completeness', 54, 'blue']].map(([label, value, color]) => <div className="indicator" key={label as string}><div><span>{label}</span><b>{value}%</b></div><div className="indicator-track"><span className={`indicator-${color}`} style={{ width: `${value}%` }} /></div></div>)}</div><p className="data-note">Interface-only sample indicators. Replace with validated project data in production.</p></Panel></div>
  </>
}

export function ReportsPage({ currentProject, currentProjectId, projects, reports, simulationRuns, createReport, notify }: Props) {
  const [preview, setPreview] = useState<SavedReport | null>(null)
  const sectionNames = ['Executive summary', 'Project overview', 'Vehicle configuration', 'Selected components', 'Material analysis', 'Simulation summary', 'Performance snapshot', 'Optimization notes']
  const [includedSections, setIncludedSections] = useState(sectionNames)
  const reportProjectId = preview?.projectId ?? currentProjectId
  const reportProject = preview ? (preview.projectSnapshot ?? projects.find(project => project.id === preview.projectId)) : currentProject
  const currentReports = reports.filter(report => report.projectId === currentProjectId)
  const reportDate = preview?.createdAt ?? new Date().toISOString().slice(0, 10)
  const reportTitle = preview?.title ?? `${reportProject?.name ?? 'Vehicle'} — Engineering Summary`
  const projectRuns = simulationRuns.filter(run => run.projectId === reportProjectId)
  const latestRun = preview ? preview.simulationSnapshot : projectRuns[0]
  const csv = () => {
    const rows: string[][] = [['Section', 'Field', 'Value']]
    if (includedSections.includes('Project overview')) rows.push(['Project', 'Name', reportProject?.name ?? 'Not available'], ['Project', 'Description', reportProject?.description ?? 'Not provided'], ['Project', 'Status', reportProject?.status ?? 'Not available'])
    if (includedSections.includes('Vehicle configuration')) {
      rows.push(['Vehicle', 'Type', reportProject?.body ?? 'Not available'], ['Vehicle', 'Powertrain', reportProject?.powertrain ?? 'Not available'], ['Vehicle', 'Primary material', reportProject?.material ?? 'Not available'])
      if (reportProject?.dimensions) rows.push(['Vehicle', 'Dimensions (length × width × height)', `${reportProject.dimensions.length.toFixed(1)} × ${reportProject.dimensions.width.toFixed(1)} × ${reportProject.dimensions.height.toFixed(1)} m`])
      if (reportProject?.targets) rows.push(['Design targets', 'Range target', `${reportProject.targets.range} km`], ['Design targets', 'Battery target', `${reportProject.targets.battery} kWh`], ['Design targets', 'Drag coefficient target', reportProject.targets.drag.toFixed(2)])
    }
    if (includedSections.includes('Selected components')) (reportProject?.selectedComponents ?? []).forEach((item, index) => rows.push(['Selected components', `Component ${index + 1}`, item]))
    if (includedSections.includes('Material analysis')) rows.push(['Materials', 'Primary material', reportProject?.material ?? 'Not available'], ['Materials', 'Property data', 'Not available in project data'])
    if (includedSections.includes('Simulation summary')) rows.push(['Simulation', 'Latest run', latestRun ? `${latestRun.module} · ${latestRun.status} · ${latestRun.createdAt}` : 'No simulation run saved for this project'])
    if (includedSections.includes('Performance snapshot')) ['Estimated driving range', 'Energy consumption', 'Vehicle mass', 'CO₂ estimate'].forEach(label => rows.push(['Performance snapshot', label, 'Not calculated']))
    if (includedSections.includes('Optimization notes')) rows.push(['Optimization', 'Result', 'No optimization result saved for this project'])
    const content = `\uFEFF${rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')}`
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${(reportProject?.name ?? 'veytrix').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-engineering-summary.csv`; anchor.click(); URL.revokeObjectURL(url); notify('Project report CSV exported')
  }
  return <><PageIntro page="reports" title={<>Engineering work,<br /><span className="gradient-text">clearly presented.</span></>} description="Assemble a project-linked engineering summary, reopen saved reports or print a PDF." action={<DemoFlag children="DEMONSTRATION · NOT VALIDATED" />} /><div className="report-workspace"><Panel className="report-builder"><SectionTitle eyebrow="REPORT BUILDER" title="Choose what to include" /><p className="muted">Report values come from the selected project and its saved simulation runs. Missing engineering metrics are marked as not calculated.</p><div className="report-sections">{sectionNames.map(name => { const Icon = name === 'Executive summary' || name === 'Material analysis' ? Sparkles : name === 'Project overview' ? Box : name === 'Vehicle configuration' ? Settings2 : name === 'Selected components' ? Layers3 : name === 'Simulation summary' ? Wind : name === 'Performance snapshot' ? Gauge : ArrowUpRight; const detail = name === 'Executive summary' ? 'Scope, status and data limitations' : name === 'Project overview' ? 'Project identity and description' : name === 'Vehicle configuration' ? 'Architecture, powertrain and targets' : name === 'Selected components' ? 'Components saved to this project' : name === 'Material analysis' ? 'Primary material and available evidence' : name === 'Simulation summary' ? 'Latest run linked to this project' : name === 'Performance snapshot' ? 'Project-supported metrics and units' : 'Optimization data associated with project'; return <label className={`report-section ${includedSections.includes(name) ? 'chosen' : ''}`} key={name}><input type="checkbox" checked={includedSections.includes(name)} onChange={() => setIncludedSections(old => old.includes(name) ? old.filter(item => item !== name) : [...old, name])} /><span className="report-check"><Check size={13} /></span><Icon size={17} /><span><b>{name}</b><small>{detail}</small></span></label> })}</div><div className="panel-actions"><Button onClick={() => setPreview(createReport(`${reportProject?.name ?? 'Vehicle'} — Engineering Summary`, includedSections))} icon={<FileText size={15} />}>Generate and save report</Button><Button variant="secondary" onClick={csv} icon={<Download size={15} />}>Export CSV</Button></div></Panel><div className="report-preview-column"><Panel className="report-preview"><div className="preview-topline"><span className="eyebrow small-eyebrow">PREVIEW · VEYTRIX REPORT</span><button onClick={() => { window.print(); notify('Print dialog opened — choose Save as PDF') }}><Download size={15} /> Print / Save PDF</button></div><article className="document-preview"><header className="document-brand"><img className="document-logo" src={assetUrl('/logo/veytrix-logo.svg')} alt="VEYTRIX Engineering Intelligence" /><span className="document-status">DEMONSTRATION · NOT VALIDATED</span></header><div className="document-rule"/><div className="document-meta"><span>VEHICLE ENGINEERING · PROJECT SUMMARY</span><span>GENERATED {reportDate}</span></div><h2>{reportTitle}</h2><p className="document-lede">Project report · {reportProject?.name ?? 'No current project'}</p>
      {includedSections.includes('Executive summary') && <section className="document-section"><h3>1. Executive Summary</h3><p>This report summarizes the saved project configuration and available project-linked simulation records. It does not contain validated engineering findings. Performance metrics without project data are identified as not calculated.</p></section>}
      {includedSections.includes('Project overview') && <section className="document-section"><h3>2. Project Overview</h3><div className="document-facts"><div><span>PROJECT</span><b>{reportProject?.name ?? 'Not available'}</b></div><div><span>PROJECT STATUS</span><b>{reportProject?.status ?? 'Not available'}</b></div><div><span>DESCRIPTION</span><b>{reportProject?.description || 'Not provided'}</b></div></div></section>}
      {includedSections.includes('Vehicle configuration') && <section className="document-section"><h3>3. Vehicle Configuration</h3><div className="document-facts"><div><span>VEHICLE TYPE</span><b>{reportProject?.body ?? 'Not available'}</b></div><div><span>POWERTRAIN</span><b>{reportProject?.powertrain ?? 'Not available'}</b></div><div><span>PRIMARY MATERIAL</span><b>{reportProject?.material ?? 'Not available'}</b></div></div>{reportProject?.dimensions && <p>Dimensions (length × width × height): {reportProject.dimensions.length.toFixed(1)} × {reportProject.dimensions.width.toFixed(1)} × {reportProject.dimensions.height.toFixed(1)} m.</p>}{reportProject?.targets && <div className="document-facts"><div><span>RANGE TARGET</span><b>{reportProject.targets.range} km</b></div><div><span>BATTERY TARGET</span><b>{reportProject.targets.battery} kWh</b></div><div><span>DRAG COEFFICIENT TARGET</span><b>{reportProject.targets.drag.toFixed(2)}</b></div></div>}</section>}
      {includedSections.includes('Selected components') && <section className="document-section"><h3>4. Selected Components</h3>{reportProject?.selectedComponents?.length ? <ul className="document-component-list">{reportProject.selectedComponents.map((component, index) => <li key={`${component}-${index}`}>{component}</li>)}</ul> : <p>No components are selected for this project.</p>}</section>}
      {includedSections.includes('Material analysis') && <section className="document-section"><h3>5. Material Analysis</h3><p>Primary material: <b>{reportProject?.material ?? 'Not available'}</b>.</p><p>Material properties and supplier-specific specifications are not stored in this project report.</p></section>}
      {includedSections.includes('Simulation summary') && <section className="document-section"><h3>6. Simulation Summary</h3>{latestRun ? <><div className="document-facts"><div><span>SIMULATION</span><b>{latestRun.module}</b></div><div><span>RUN STATUS</span><b>{latestRun.status}</b></div><div><span>RUN DATE</span><b>{latestRun.createdAt}</b></div></div><p>Calculation version: {latestRun.calculationVersion ?? 'Not recorded'}. Run records in this prototype are demonstration outputs, not validated solver results.</p>{latestRun.assumptions?.length ? <><b>Recorded assumptions</b><ul className="document-component-list">{latestRun.assumptions.map((assumption, index) => <li key={`${index}-${assumption}`}>{assumption}</li>)}</ul></> : null}</> : <p>No simulation run is saved for this project.</p>}</section>}
      {includedSections.includes('Performance snapshot') && <section className="document-section"><h3>7. Performance Snapshot</h3><div className="document-metrics">{[{ label: 'Estimated driving range', value: 'Not calculated', unit: 'km' }, { label: 'Energy consumption', value: 'Not calculated', unit: 'kWh / 100 km' }, { label: 'Vehicle mass', value: 'Not calculated', unit: 'kg' }, { label: 'CO₂ estimate', value: 'Not calculated', unit: 'Not available' }].map(item => <div key={item.label}><span>{item.label}</span><b>{item.value} <small>{item.unit}</small></b></div>)}</div>{reportProject?.targets && <p>Design range target: {reportProject.targets.range} km. A target is not a calculated driving-range estimate.</p>}</section>}
      {includedSections.includes('Optimization notes') && <section className="document-section"><h3>8. Optimization Notes</h3><p>No optimization result is saved with this project. No performance change is inferred here.</p></section>}
      <div className="document-disclaimer">SAMPLE CONTENT · Project status and saved configuration are shown as recorded. Missing performance metrics are not calculated; this report is not a validated engineering finding.</div><footer className="document-footer"><span>VEYTRIX ENGINEERING INTELLIGENCE · {reportProject?.name ?? 'PROJECT REPORT'}</span><span>{reportDate}</span></footer></article></Panel><Panel className="saved-reports"><SectionTitle eyebrow="LOCAL ARCHIVE" title={`Saved Reports · ${currentReports.length}`} />{currentReports.length ? currentReports.map(report => <button className="saved-report-row" key={report.id} onClick={() => { setPreview(report); setIncludedSections(report.includedSections ?? sectionNames) }}><span><FileText size={17} /></span><b>{report.title}<small>Saved {report.createdAt} · Project report</small></b><ChevronRight size={15} /></button>) : <p className="muted">No saved reports for this project yet. Generate and save a report to add it to this browser’s local archive.</p>}</Panel></div></div></>
}
const articles = [
  { category: 'Powertrain', title: 'A system view of next-generation EV powertrains', summary: 'How motor, inverter and thermal choices shape efficiency at the vehicle level.', read: '8 min', cover: assetUrl('/images/journal/powertrain-journal.png'), alt: 'Electric traction motor and powertrain assembly under cyan and orange studio lighting' },
  { category: 'Materials', title: 'Material selection beyond the strength number', summary: 'A practical framework for balancing mass, manufacturing and lifecycle needs.', read: '6 min', cover: assetUrl('/images/journal/materials-journal.png'), alt: 'Layered carbon fibre, aluminium and composite engineering material samples' },
  { category: 'Aerodynamics', title: 'Reading airflow: from concept shape to test plan', summary: 'A primer on interpreting early aerodynamic visualizations responsibly.', read: '7 min', cover: assetUrl('/images/journal/aerodynamics-journal.png'), alt: 'Futuristic electric vehicle surrounded by colored airflow streamlines' },
  { category: 'Guides', title: 'Build a useful vehicle simulation brief', summary: 'Define the question, assumptions and outputs before a model run begins.', read: '5 min', cover: assetUrl('/images/journal/engineering-guides.png'), alt: 'Automotive chassis engineering assembly presented as a technical design study' },
  { category: 'Case Studies', title: 'A compact platform range study', summary: 'A fictional demonstration case about packaging trade-offs in an urban EV.', read: '9 min', cover: assetUrl('/images/journal/engineering-case-studies.png'), alt: 'Blue electric sedan in a cinematic automotive engineering studio' },
  { category: 'Research', title: 'Battery thermal management, at a glance', summary: 'A short tour of common cooling approaches and the questions they raise.', read: '10 min', cover: assetUrl('/images/journal/engineering-research.png'), alt: 'Scientific vehicle engineering simulation visualization with a data surface and vehicle model' },
]

const featuredArticle: typeof articles[number] = {
  category: 'Engineering',
  title: 'Build the whole system, not the part alone',
  summary: 'Vehicle decisions are connected. A useful concept workflow keeps packaging, energy, thermal, material and performance conversations close together. Begin with a clear question, make assumptions explicit, then compare a small number of traceable options.',
  read: '8 min',
  cover: assetUrl('/images/journal/engineering-case-studies.png'),
  alt: 'Vehicle engineering concept shown in a premium dark studio',
}

function FeaturedBriefingScene() {
  const trackPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    const parallax = event.currentTarget.querySelector<HTMLElement>('.feature-parallax')
    parallax?.style.setProperty('--briefing-tilt-x', `${(-y * 3).toFixed(2)}deg`)
    parallax?.style.setProperty('--briefing-tilt-y', `${(x * 4).toFixed(2)}deg`)
    parallax?.style.setProperty('--briefing-shift-x', `${(x * 7).toFixed(1)}px`)
    parallax?.style.setProperty('--briefing-shift-y', `${(y * 5).toFixed(1)}px`)
  }
  const resetPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const parallax = event.currentTarget.querySelector<HTMLElement>('.feature-parallax')
    parallax?.style.setProperty('--briefing-tilt-x', '0deg')
    parallax?.style.setProperty('--briefing-tilt-y', '0deg')
    parallax?.style.setProperty('--briefing-shift-x', '0px')
    parallax?.style.setProperty('--briefing-shift-y', '0px')
  }

  return <div className="feature-engineering-scene" onPointerMove={trackPointer} onPointerLeave={resetPointer} aria-label="Interactive VEYTRIX electric vehicle engineering showroom">
    <svg className="feature-system-links" viewBox="0 0 620 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="M75 68 C132 68 152 84 205 112"/><path d="M544 62 C485 68 470 86 420 111"/>
      <path d="M68 238 C142 224 160 204 211 183"/><path d="M548 237 C485 226 463 205 414 182"/>
      <circle cx="205" cy="112" r="3"/><circle cx="420" cy="111" r="3"/><circle cx="211" cy="183" r="3"/><circle cx="414" cy="182" r="3"/>
    </svg>
    <div className="feature-scene-float"><div className="feature-parallax"><Vehicle3DViewer className="feature-vehicle-viewer" fallbackImage={assetUrl('/images/veytrix-car.png')} fallbackAlt="VEYTRIX electric sports sedan on an illuminated studio platform" interactive={false} showCaption={false}/></div></div>
    <div className="feature-system-callout feature-system-motor"><Settings2 size={15}/><span><b>VX DRIVE</b><small>POWERTRAIN</small></span></div>
    <div className="feature-system-callout feature-system-battery"><Battery size={15}/><span><b>ENERGY</b><small>BATTERY SYSTEM</small></span></div>
    <div className="feature-system-callout feature-system-chassis"><Layers3 size={15}/><span><b>MONOCOQUE</b><small>CHASSIS</small></span></div>
    <div className="feature-system-callout feature-system-network"><Gauge size={15}/><span><b>CONNECTED</b><small>VEHICLE SYSTEMS</small></span></div>
    <span className="feature-scene-caption">VEYTRIX SYSTEMS / CONNECTED CONCEPT</span>
  </div>
}

export function ExplorePage({ notify }: Props) {
  const [category, setCategory] = useState('All topics')
  const [query, setQuery] = useState('')
  const [article, setArticle] = useState<typeof articles[number] | null>(null)
  const cats = ['All topics', ...Array.from(new Set(articles.map(item => item.category)))]
  const filtered = articles.filter(item => (category === 'All topics' || item.category === category) && `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(query.toLowerCase()))
  return <>
    <PageIntro page="explore" title={<>Ideas from across<br /><span className="gradient-text">vehicle engineering.</span></>} description="A curated editorial space for technology briefings, practical guides and design case studies. This library contains sample editorial content." action={<DemoFlag children="SAMPLE EDITORIAL CONTENT" />} />
    <div className="explore-feature"><div className="feature-orbit"/><FeaturedBriefingScene/><div className="feature-copy"><span className="eyebrow">FEATURED BRIEFING • 08 MIN READ</span><h2>Build the whole system,<br /><span className="gradient-text">not the part alone.</span></h2><p>Explore the links between vehicle architecture, subsystem choices and the outcomes engineers care about.</p><button className="text-button" onClick={() => setArticle(featuredArticle)}>Read featured briefing <ArrowRight size={15} /></button></div><span className="feature-kicker">VEYTRIX JOURNAL / 001</span></div>
    <div className="explore-toolbar"><div><SectionTitle eyebrow="FIELD NOTES" title="Explore the journal" /><p className="muted">Engineering perspectives for curious builders.</p></div><label className="search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the journal..." /></label></div>
    <div className="category-tabs">{cats.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className="article-grid">{filtered.map((item, index) => <button className="article-card" key={item.title} onClick={() => setArticle(item)}><div className="article-art"><img src={item.cover} alt={item.alt} width="1200" height="675" loading="lazy" decoding="async" onError={() => { if (import.meta.env.DEV) console.warn(`Journal cover failed to load: ${item.cover}`) }} /><i className="article-grid-lines"/><small>VEYTRIX / FIELD NOTE {String(index + 1).padStart(2, '0')}</small></div><div className="article-copy"><div><span className="eyebrow small-eyebrow">{item.category}</span><span>{item.read} read</span></div><h3>{item.title}</h3><p>{item.summary}</p><span className="article-link">Read article <ArrowRight size={14} /></span></div></button>)}</div>
    {filtered.length === 0 && <EmptyState title="No articles found" body="Try another phrase or clear the selected topic." />}
    {article && <Modal title={article.title} close={() => setArticle(null)}><img className="article-modal-cover" src={article.cover} alt={article.alt} width="1200" height="675" /><span className="eyebrow small-eyebrow">{article.category} • {article.read.toUpperCase()} READ</span><p className="article-modal-lede">{article.summary}</p><p className="muted">Good engineering exploration starts by stating a question and its boundaries. Then make the assumptions visible, compare candidates against the same criteria and document the evidence behind each decision. Early models can help teams learn where to look next; they are not a substitute for validated data or qualified review.</p><div className="article-modal-callout"><Sparkles size={18} /><span>This editorial item is sample content for the VEYTRIX prototype.</span></div><Button variant="secondary" onClick={() => { setArticle(null); notify('Article marked as saved in this demo session') }}>Save for later</Button></Modal>}
  </>
}

export function ProfilePage({ projects, setProjects, currentProjectId, setCurrentProjectId, navigate, notify, reports, simulationRuns }: Props) {
  const [tab, setTab] = useState('Projects')
  const [newDialog, setNewDialog] = useState(false)
  const [editing, setEditing] = useState<VehicleProject | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const projectReports = reports
  const create = () => { if (!draftName.trim()) { notify('Enter a project name'); return } const now = new Date().toISOString().slice(0, 10); const project: VehicleProject = { id: `project-${crypto.randomUUID()}`, name: draftName.trim(), description: draftDescription, body: 'Concept', powertrain: 'Electric', material: 'Carbon Fiber', selectedComponents: [], createdAt: now, updatedAt: now, status: 'Draft' }; setProjects(old => [project, ...old]); setCurrentProjectId(project.id); setDraftName(''); setDraftDescription(''); setNewDialog(false); notify('Project created and saved locally') }
  const duplicate = (project: VehicleProject) => { const now = new Date().toISOString().slice(0, 10); const copy: VehicleProject = { ...project, id: `project-${crypto.randomUUID()}`, name: `${project.name} copy`, selectedComponents: [...(project.selectedComponents ?? [])], dimensions: project.dimensions ? { ...project.dimensions } : undefined, targets: project.targets ? { ...project.targets } : undefined, simulationSettings: project.simulationSettings ? structuredClone(project.simulationSettings) : undefined, optimizationSettings: project.optimizationSettings ? { ...project.optimizationSettings, objectives: [...project.optimizationSettings.objectives] } : undefined, versions: project.versions?.map(version => ({ ...version, selectedComponents: [...(version.selectedComponents ?? [])], dimensions: version.dimensions ? { ...version.dimensions } : undefined, targets: version.targets ? { ...version.targets } : undefined })), componentHistory: project.componentHistory?.map(item => ({ ...item })), materialHistory: project.materialHistory?.map(item => ({ ...item })), createdAt: now, updatedAt: now, status: 'Draft' }; setProjects(old => [copy, ...old]); notify('Project duplicated') }
  const exportProject = (project: VehicleProject) => { const blob = new Blob([JSON.stringify({ format: 'veytrix-project-v1', exportedAt: new Date().toISOString(), project }, null, 2)], { type: 'application/json;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.veytrix.json'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Project configuration exported') }
  const remove = (project: VehicleProject) => { if (!window.confirm(`Delete ${project.name} from this browser?`)) return; const remaining = projects.filter(item => item.id !== project.id); setProjects(remaining); if (currentProjectId === project.id) setCurrentProjectId(remaining[0]?.id ?? ''); notify('Project deleted') }
  const edit = (project: VehicleProject) => { setEditing(project); setEditName(project.name); setEditDescription(project.description) }
  const saveEdit = () => { if (!editing || !editName.trim()) { notify('Project name is required'); return } setProjects(old => old.map(project => project.id === editing.id ? { ...project, name: editName.trim(), description: editDescription, updatedAt: new Date().toISOString().slice(0, 10) } : project)); setEditing(null); notify('Project details saved') }
  const openProject = (project: VehicleProject) => { setCurrentProjectId(project.id); navigate('studio') }
  const activity = useMemo(() => [...projects.map(project => ({ type: 'Vehicle project', name: project.name, date: project.updatedAt, id: project.id, page: 'studio' as PageId })), ...reports.map(report => ({ type: 'Engineering report', name: report.title, date: report.createdAt, id: report.id, page: 'reports' as PageId })), ...simulationRuns.map(run => ({ type: 'Simulation run', name: `${run.module} · ${run.projectName}`, date: run.createdAt, id: run.id, page: 'simulation' as PageId }))].sort((a, b) => b.date.localeCompare(a.date)), [projects, reports, simulationRuns])
  return <><PageIntro page="profile" title={<>Your workspace,<br /><span className="gradient-text">your projects.</span></>} description="A local-first prototype workspace. Project, report and profile data are saved in this browser on this device." action={<Button onClick={() => setNewDialog(true)} icon={<Plus size={15} />}>New project</Button>} /><div className="profile-overview"><Panel className="profile-card"><div className="profile-avatar">SR</div><div className="profile-identity"><span className="eyebrow small-eyebrow">DEMO ENGINEER</span><h2>Syed Rahman</h2><p>Vehicle Systems · Engineering Workspace</p></div><span className="status-chip"><span className="live-dot" /> Local prototype</span><div className="profile-metrics"><div><b>{projects.length}</b><span>vehicle projects</span></div><div><b>{activity.filter(item => item.type === 'Engineering report').length}</b><span>saved reports</span></div><div><b>{new Set(projects.map(project => project.status)).size}</b><span>project states</span></div></div></Panel><Panel className="profile-callout"><div className="callout-icon"><LockKeyhole size={18} /></div><div><span className="eyebrow small-eyebrow">ACCOUNT &amp; DATA</span><h3>Prototype workspace</h3><p>Sign-in, cloud sync and account recovery require a backend connection. This demo stores project data only in local browser storage.</p><button className="text-button" onClick={() => notify('Authentication is not connected in this prototype')}>Account settings <ArrowRight size={14} /></button></div></Panel></div><div className="profile-tabs">{['Projects', 'Recent activity', 'Saved reports', 'Settings'].map(item => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === 'Projects' && <Panel className="projects-panel"><div className="panel-heading"><div><span className="eyebrow small-eyebrow">LOCAL PROJECT LIBRARY</span><h2>Vehicle Projects ({projects.length})</h2></div><Button onClick={() => setNewDialog(true)} icon={<Plus size={15} />}>Create project</Button></div>{projects.length ? <div className="project-list">{projects.map(project => <div className="project-row" key={project.id}><div className="project-thumb"><VehicleAssetImage body={project.body} className="project-thumb-image" /><small>{project.body.toUpperCase()} · VEYTRIX</small></div><div className="project-row-copy"><div><span className={`project-status status-${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span><span className="project-updated">Updated {project.updatedAt}</span></div><h3>{project.name}</h3><p>{project.description || 'No description added.'}</p><div className="project-tags"><span>{project.body}</span><span>{project.powertrain}</span><span>{project.material}</span></div></div><div className="project-actions"><button onClick={() => openProject(project)}><Settings2 size={15} /> Open project</button><button onClick={() => edit(project)}><FileText size={15} /> Edit details</button><button onClick={() => duplicate(project)}><Plus size={15} /> Duplicate</button><button onClick={() => exportProject(project)}><Download size={15} /> Export</button><button className="danger-action" onClick={() => remove(project)}><X size={15} /> Delete</button></div></div>)}</div> : <EmptyState title="Start your first vehicle project" body="Create a project to explore a configurable engineering workspace." action={<Button onClick={() => setNewDialog(true)} icon={<Plus size={15} />}>Create project</Button>} />}</Panel>}{tab === 'Recent activity' && <Panel className="activity-panel"><SectionTitle eyebrow="ACTIVITY" title="Recent project activity" />{activity.length ? activity.map(item => <button className="activity-row" key={item.id} onClick={() => { if (item.page === 'studio') setCurrentProjectId(item.id); navigate(item.page) }}><span className="activity-icon">{item.type === 'Vehicle project' ? <Box size={16} /> : <FileText size={16} />}</span><span><b>{item.name}</b><small>{item.type} · {item.date}</small></span><ChevronRight size={16} /></button>) : <EmptyState title="No activity yet" body="Your projects and reports will appear here." />}</Panel>}{tab === 'Saved reports' && <Panel className="activity-panel"><SectionTitle eyebrow="REPORT LIBRARY" title="Saved engineering reports" />{projectReports.length ? projectReports.map(report => <button className="activity-row" key={report.id} onClick={() => navigate('reports')}><span className="activity-icon"><FileText size={16} /></span><span><b>{report.title}</b><small>{projects.find(project => project.id === report.projectId)?.name ?? 'Project removed'} · {report.createdAt}</small></span><ChevronRight size={16} /></button>) : <EmptyState title="No saved reports" body="Generate a report for a project to add it to your local library." action={<Button onClick={() => navigate('reports')}>Open reports</Button>} />}</Panel>}{tab === 'Settings' && <Panel className="settings-panel"><SectionTitle eyebrow="WORKSPACE SETTINGS" title="Preferences" /><div className="setting-row"><div><b>Reduced motion</b><small>Follow the operating system motion preference.</small></div><span className="status-chip">System default</span></div><div className="setting-row"><div><b>Sample Project Data</b><small>Vehicle projects and reports stay in browser storage.</small></div><span className="status-chip">Enabled</span></div><div className="setting-row"><div><b>Authentication</b><small>Cloud sign-in is not connected in this prototype.</small></div><Button variant="secondary" onClick={() => notify('Connect an authentication provider in the backend to enable sign-in')}>Connection info</Button></div><div className="setting-row"><div><b>Clear local projects</b><small>Remove all saved vehicle projects from this browser.</small></div><Button variant="danger" onClick={() => { if (window.confirm('Delete all locally saved projects and reports from this browser?')) { setProjects([]); setCurrentProjectId(''); notify('Local projects cleared') } }}>Clear projects</Button></div></Panel>}{editing && <Modal title="Edit project details" close={() => setEditing(null)}><label className="field-label">Project name<input autoFocus value={editName} onChange={event => setEditName(event.target.value)} /></label><label className="field-label">Description<textarea rows={3} value={editDescription} onChange={event => setEditDescription(event.target.value)} /></label><div className="modal-actions"><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveEdit} icon={<Save size={15} />}>Save changes</Button></div></Modal>}{newDialog && <Modal title="Create a vehicle project" close={() => setNewDialog(false)}><label className="field-label">Project name<input autoFocus value={draftName} onChange={event => setDraftName(event.target.value)} placeholder="e.g. City EV study" /></label><label className="field-label">Description<textarea rows={3} value={draftDescription} onChange={event => setDraftDescription(event.target.value)} placeholder="Describe the vehicle concept or engineering question." /></label><div className="modal-actions"><Button variant="secondary" onClick={() => setNewDialog(false)}>Cancel</Button><Button onClick={create} icon={<Plus size={15} />}>Create project</Button></div></Modal>}</>
}








