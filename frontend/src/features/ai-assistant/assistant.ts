import { components, materials, type VehicleProject } from '../../constants/model'

/**
 * Offline, rule-based preview for the future AI assistant.
 * It uses the visible project and sample component catalog; it does not call an LLM.
 */
export function answerEngineeringQuestion(question: string, project?: VehicleProject) {
  const q = question.toLowerCase()
  const powertrain = project?.powertrain ?? 'Electric'
  const selected = project?.selectedComponents ?? []
  const incompatibilities: string[] = []
  if (powertrain === 'Electric' && selected.some(name => name.toLowerCase().includes('combustion') || name.toLowerCase().includes('inline engine'))) {
    incompatibilities.push('The selected conventional engine conflicts with this project’s Electric powertrain choice.')
  }
  if (powertrain === 'Conventional' && selected.some(name => name.toLowerCase().includes('battery pack'))) {
    incompatibilities.push('A high-voltage traction battery is unusual for the selected Conventional configuration; confirm the intended hybrid architecture.')
  }

  let response = ''
  let component = ''
  let material = ''
  if (/material|light|weight|mass/.test(q)) {
    const candidate = materials.find(item => item.short === 'Aluminium Alloy') ?? materials[0]
    material = candidate.short
    response = 'For a mass-focused concept, compare aluminium alloy and carbon-fiber composite against manufacturing, joining, repairability, crash behavior, and cost constraints. The local catalog values are indicative class references only.'
  } else if (/range|battery|energy|efficien/.test(q)) {
    const candidate = components.find(item => item.name.includes('Battery Pack'))
    component = candidate?.name ?? ''
    response = 'Start with a target drive cycle and energy use assumption, then estimate pack energy from range × consumption ÷ usable fraction. The current browser calculator uses a steady, level-road estimate and omits accessories, grade, weather, aging, and traffic.'
  } else if (/cost|price|budget/.test(q)) {
    const candidate = components.find(item => item.category === 'Powertrain' && item.name.includes('VX-210'))
    component = candidate?.name ?? ''
    response = 'Cost comparisons should include the full system boundary: component purchase, cooling, power electronics, integration, manufacturing, service, and lifecycle. The component catalog contains illustrative estimates, not supplier quotations.'
  } else if (/power|torque|acceler/.test(q)) {
    component = components.find(item => item.category === 'Powertrain' && item.name.includes('VX-210'))?.name ?? ''
    response = 'For an initial power estimate, calculate road-load force at the target speed and add the requested acceleration force, then divide wheel power by assumed drivetrain efficiency. Gear ratios, torque curves, traction, thermal limits, and duty cycle still need detailed analysis.'
  } else {
    response = 'I can help explore component fit, material trade-offs, range assumptions, and early motor sizing using the current project and sample component catalog. State a target or constraint, such as “reduce mass” or “estimate range”.'
  }

  return { response, component, material, incompatibilities, scope: 'Rule-based preview · not an AI model or engineering approval' }
}

