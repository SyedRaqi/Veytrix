import { assetUrl } from './utils/assetUrl'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronDown, Menu, Search, Sparkles, Send, X } from 'lucide-react'
import { HomePage, StudioPage, SimulationPage, LibraryPage, MaterialsPage, OptimizationPage, AnalyticsPage, ReportsPage, ExplorePage, ProfilePage } from './pages'
import { initialProjects, navItems, type PageId, type ProjectVersion, type SavedReport, type SimulationRun, type VehicleProject } from './constants/model'
import { answerEngineeringQuestion } from './features/ai-assistant/assistant'
import { CALCULATION_VERSION } from './features/simulation-engine/engineering'
import Atmosphere from './components/common/Atmosphere'

const pageComponents = { home: HomePage, studio: StudioPage, simulation: SimulationPage, library: LibraryPage, materials: MaterialsPage, optimization: OptimizationPage, analytics: AnalyticsPage, reports: ReportsPage, explore: ExplorePage, profile: ProfilePage }

function readLocal<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

function repairSavedReportTitle(title: string) {
  return title.replaceAll('\u00e2\u20ac\u201d', '\u2014').replaceAll('\u00e2\u20ac\u201c', '\u2013').replaceAll('\u00c2\u00b7', '\u00b7')
}

export default function App() {
  const [page, setPage] = useState<PageId>(() => {
    const fromHash = window.location.hash.slice(1) as PageId
    return navItems.some(item => item.id === fromHash) ? fromHash : 'home'
  })
  const [projects, setProjects] = useState<VehicleProject[]>(() => readLocal('veytrix-projects', initialProjects))
  const [reports, setReports] = useState<SavedReport[]>(() => readLocal<SavedReport[]>('veytrix-reports', []).map(report => ({ ...report, title: repairSavedReportTitle(report.title) })))
  const [simulationRuns, setSimulationRuns] = useState<SimulationRun[]>(() => readLocal('veytrix-simulation-runs', []))
  const [currentProjectId, setCurrentProjectId] = useState(() => readLocal('veytrix-current-project', 'project-aero'))
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [quickSearch, setQuickSearch] = useState(false)
  const [query, setQuery] = useState('')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantQuestion, setAssistantQuestion] = useState('')
  const [assistantAnswer, setAssistantAnswer] = useState<ReturnType<typeof answerEngineeringQuestion> | null>(null)

  useEffect(() => { try { localStorage.setItem('veytrix-projects', JSON.stringify(projects)) } catch { setToast('Browser storage is full; project changes may not persist') } }, [projects])
  useEffect(() => { try { localStorage.setItem('veytrix-reports', JSON.stringify(reports)) } catch { setToast('Browser storage is unavailable; reports may not persist') } }, [reports])
  useEffect(() => { try { localStorage.setItem('veytrix-simulation-runs', JSON.stringify(simulationRuns)) } catch { setToast('Browser storage is unavailable; run history may not persist') } }, [simulationRuns])
  useEffect(() => { try { localStorage.setItem('veytrix-current-project', JSON.stringify(currentProjectId)) } catch { setToast('Browser storage is unavailable; project selection may not persist') } }, [currentProjectId])
  useEffect(() => {
    const onHash = () => { const id = window.location.hash.slice(1) as PageId; if (navItems.some(item => item.id === id)) setPage(id) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer) }, [toast])
  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.app-shell')
    if (!shell || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const move = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - .5) * 12
      const y = (event.clientY / window.innerHeight - .5) * 9
      shell.style.setProperty('--pointer-x', `${x.toFixed(1)}px`)
      shell.style.setProperty('--pointer-y', `${y.toFixed(1)}px`)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const navigate = useCallback((next: PageId) => {
    setPage(next); setMobileNav(false); window.location.hash = next; window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const notify = useCallback((message: string) => setToast(message), [])
  const currentProject = useMemo(() => projects.find(project => project.id === currentProjectId) ?? projects[0], [projects, currentProjectId])
  const saveProject = useCallback((draft: Omit<VehicleProject, 'id' | 'createdAt' | 'updatedAt' | 'status'>, existingId?: string) => {
    const now = new Date().toISOString().slice(0, 10)
    if (existingId) {
      setProjects(old => old.map(project => {
        if (project.id !== existingId) return project
        const snapshot: ProjectVersion = { number: (project.versions?.length ?? 0) + 1, savedAt: now, name: project.name, description: project.description, body: project.body, powertrain: project.powertrain, material: project.material, selectedComponents: [...(project.selectedComponents ?? [])], dimensions: project.dimensions ? { ...project.dimensions } : undefined, targets: project.targets ? { ...project.targets } : undefined, simulationSettings: project.simulationSettings, optimizationSettings: project.optimizationSettings ? { ...project.optimizationSettings, objectives: [...project.optimizationSettings.objectives] } : undefined }
        return { ...project, ...draft, versions: [...(project.versions ?? []), snapshot], updatedAt: now, status: 'In progress' }
      }))
      setCurrentProjectId(existingId); notify('Project saved to this browser')
      return existingId
    }
    const id = `project-${crypto.randomUUID()}`
    setProjects(old => [{ ...draft, id, createdAt: now, updatedAt: now, status: 'Draft' }, ...old])
    setCurrentProjectId(id); notify('New project created'); return id
  }, [notify])
  const createReport = useCallback((title: string, includedSections?: string[]) => {
    const report = { id: `report-${crypto.randomUUID()}`, projectId: currentProjectId, title, createdAt: new Date().toISOString().slice(0, 10), projectSnapshot: currentProject ? { ...currentProject, selectedComponents: [...(currentProject.selectedComponents ?? [])] } : undefined, simulationSnapshot: simulationRuns.find(run => run.projectId === currentProjectId), includedSections }
    setReports(old => [report, ...old]); notify('Engineering report saved to this browser')
    return report
  }, [currentProject, currentProjectId, notify, simulationRuns])
  const recordSimulation = useCallback((module: string, details?: { calculationVersion: string; inputs: Record<string, number | string>; assumptions: string[]; selectedComponents?: string[] }) => {
    const run: SimulationRun = { id: `run-${crypto.randomUUID()}`, projectId: currentProjectId, projectName: currentProject?.name ?? 'Vehicle concept', module, createdAt: new Date().toISOString().slice(0, 10), status: 'Completed', calculationVersion: details?.calculationVersion ?? CALCULATION_VERSION, inputs: details?.inputs, assumptions: details?.assumptions, selectedComponents: details?.selectedComponents ? [...details.selectedComponents] : [...(currentProject?.selectedComponents ?? [])] }
    setSimulationRuns(old => [run, ...old]); notify('Demo simulation saved to recent activity')
  }, [currentProject, currentProjectId, notify])

  const askAssistant = (event: FormEvent) => { event.preventDefault(); if (assistantQuestion.trim()) setAssistantAnswer(answerEngineeringQuestion(assistantQuestion, currentProject)) }
  const applyAssistantSuggestion = () => {
    if (!currentProject || !assistantAnswer) return
    const now = new Date().toISOString().slice(0, 10)
    setProjects(old => old.map(project => project.id !== currentProjectId ? project : {
      ...project,
      ...(assistantAnswer.material ? { material: assistantAnswer.material, materialHistory: [...(project.materialHistory ?? []), { name: assistantAnswer.material, at: now }] } : {}),
      ...(assistantAnswer.component && !project.selectedComponents?.includes(assistantAnswer.component) ? { selectedComponents: [...(project.selectedComponents ?? []), assistantAnswer.component], componentHistory: [...(project.componentHistory ?? []), { name: assistantAnswer.component, action: 'added' as const, at: now }] } : {}),
      updatedAt: now,
    }))
    notify('Assistant suggestion applied to this local project')
  }
  const ActivePage = pageComponents[page]
  const pageProps = { navigate, notify, projects, setProjects, currentProject, currentProjectId, setCurrentProjectId, saveProject, reports, createReport, simulationRuns, recordSimulation }

  return <div className={`app-shell atmos-${page}`}>
    <Atmosphere />
    <header className="topbar">
      <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button>
      <button className="brand" onClick={() => navigate('home')} aria-label="Veytrix home"><img className="brand-emblem" src={assetUrl('/logo/veytrix-icon.svg')} alt="" /><span className="brand-copy"><b>VEYTRIX</b><small>ENGINEERING INTELLIGENCE</small></span></button>
      <nav className="topnav" aria-label="Primary navigation">{(['home', 'studio', 'simulation', 'library', 'explore'] as PageId[]).map(id => <button key={id} className={page === id ? 'selected' : ''} onClick={() => navigate(id)}>{navItems.find(item => item.id === id)?.label.replace('Vehicle ', '').replace(' Lab', '').replace('Component ', '')}</button>)}</nav>
      <div className="top-actions">
        <button className="icon-button" aria-label="Search platform" onClick={() => { setQuickSearch(!quickSearch); setQuery('') }}><Search size={19} /></button>
        <button className="icon-button notification-trigger" aria-label="Notifications" onClick={() => setNoticeOpen(!noticeOpen)}><Bell size={19} /><i /></button>
        <div className="profile-wrap"><button className="avatar" aria-label="Open profile menu" onClick={() => setProfileOpen(!profileOpen)}>SR</button>{profileOpen && <div className="popover profile-popover"><b>Syed Rahman</b><small>Demo workspace</small><button onClick={() => { setProfileOpen(false); navigate('profile') }}>Projects &amp; profile</button><button onClick={() => { setProfileOpen(false); notify('Account settings are demo-only in this prototype') }}>Account settings</button></div>}</div>
        <button className="button button-gradient launch-button" onClick={() => navigate('studio')}>Launch Studio <span>→</span></button>
      </div>
      {quickSearch && <form className="global-search" onSubmit={event => { event.preventDefault(); const q = query.toLowerCase(); const target = q.includes('material') ? 'materials' : q.includes('sim') ? 'simulation' : q.includes('report') ? 'reports' : q.includes('project') ? 'profile' : 'library'; navigate(target); setQuickSearch(false) }}><Search size={17} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search projects, components, materials…" /><span>Enter ↵</span><button type="button" aria-label="Close search" onClick={() => setQuickSearch(false)}><X size={16} /></button></form>}
      {noticeOpen && <div className="popover notice-popover"><div className="popover-heading">Notifications <span className="status-chip">2 new</span></div><p>Your Aero Concept 01 project was updated.</p><p>New material data added to the demo library.</p><button className="text-button" onClick={() => { setNoticeOpen(false); notify('All caught up') }}>Mark all as read</button></div>}
    </header>
    <div className={`workspace ${mobileNav ? 'workspace-nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-label">WORKSPACE</div>
        {navItems.slice(0, 8).map(item => <button key={item.id} className={`side-nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.id === 'studio' && <span className="nav-indicator" />}</button>)}
        <div className="sidebar-label sidebar-label-lower">DISCOVER</div>
        {navItems.slice(8).map(item => <button key={item.id} className={`side-nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button>)}
        <div className="workspace-card"><div className="workspace-orb">V</div><b>Engineering Workspace</b><small>Sample Project Data • Saved Locally</small><button onClick={() => navigate('profile')}>Manage Projects <span>→</span></button></div>
        <div className="sidebar-footer"><span className="live-dot" /> Prototype workspace <span>v0.1</span></div><button className="assistant-launch" onClick={() => setAssistantOpen(open => !open)}><Sparkles size={15} /> Engineering assistant <span>PREVIEW</span></button>
      </aside>
      <main className="main-content"><div className="page-context"><div><span className="breadcrumb">VEYTRIX <span>/</span> {navItems.find(item => item.id === page)?.label.toUpperCase()}</span><span className="project-context">{currentProject ? `Current Project · ${currentProject.name}` : 'Create a project to get started'}</span></div><button className="project-switch" onClick={() => navigate('profile')}>{currentProject?.name ?? 'Select project'} <ChevronDown size={15} /></button></div>
        <AnimatePresence mode="wait"><motion.div key={page} className="page-wrapper" initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}><ActivePage {...pageProps} /></motion.div></AnimatePresence>
        <footer className="app-footer"><span>VEYTRIX <span className="muted">ENGINEERING INTELLIGENCE</span></span><span>Demonstration Interface • Sample project data is illustrative</span><button onClick={() => navigate('profile')}>Workspace settings</button></footer>
      </main>
    </div>
    {assistantOpen && <section className="assistant-panel panel" aria-label="Engineering assistant preview"><div className="assistant-heading"><div><span className="eyebrow small-eyebrow">VEYTRIX ASSISTANT</span><h2>Engineering guide</h2></div><button className="icon-button" aria-label="Close assistant" onClick={() => setAssistantOpen(false)}><X size={17} /></button></div><p className="assistant-scope">Rule-based local preview · uses the current project and sample catalog.</p>{assistantAnswer && <div className="assistant-answer"><p>{assistantAnswer.response}</p>{assistantAnswer.incompatibilities.map(item => <p className="assistant-warning" key={item}>{item}</p>)}<small>{assistantAnswer.scope}</small>{(assistantAnswer.component || assistantAnswer.material) && <button className="text-button" onClick={applyAssistantSuggestion}>Apply suggestion <ChevronDown size={14} /></button>}</div>}<form className="assistant-form" onSubmit={askAssistant}><input value={assistantQuestion} onChange={event => setAssistantQuestion(event.target.value)} placeholder="Ask about range, materials, power…" aria-label="Ask engineering question" /><button className="button button-primary" aria-label="Send question"><Send size={15} /></button></form></section>}
    <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><span className="toast-check">✓</span>{toast}</motion.div>}</AnimatePresence>
  </div>
}



