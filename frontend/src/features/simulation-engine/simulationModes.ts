/**
 * Independent, concept-stage simulation inputs and calculations.
 * These are transparent estimates, not CFD, FEA, validation, or safety evidence.
 */
export const SIMULATION_TYPES = [
  'Aerodynamics',
  'Thermal Analysis',
  'Structural Analysis',
  'Vehicle Dynamics',
  'Performance',
  'Energy & Range',
] as const

export type SimulationType = typeof SIMULATION_TYPES[number]
export type SimulationMetric = { label: string; value: number | string; unit: string }
export type SimulationCalculation = {
  metrics: SimulationMetric[]
  status: 'Estimated' | 'Calculated' | 'Validated'
  assumptions: string[]
  calculationVersion: string
}

export type AerodynamicsParameters = {
  vehicleSpeedKph: number
  airDensityKgM3: number
  frontalAreaM2: number
  dragCoefficient: number
  windSpeedKph: number
  yawAngleDeg: number
}
export type ThermalParameters = {
  ambientTemperatureC: number
  coolantTemperatureC: number
  coolantFlowKgS: number
  motorTemperatureC: number
  batteryTemperatureC: number
  heatGenerationKw: number
}
export type StructuralParameters = {
  appliedLoadKn: number
  material: 'Carbon fiber' | 'Aluminium alloy' | 'Steel' | 'Titanium alloy'
  youngsModulusGPa: number
  poissonsRatio: number
  vehicleMassKg: number
  forceDirection: 'Axial' | 'Lateral' | 'Torsional'
  boundaryConditions: 'Fixed ends' | 'Simply supported' | 'Cantilever'
}
export type VehicleDynamicsParameters = {
  vehicleSpeedKph: number
  steeringAngleDeg: number
  wheelbaseM: number
  vehicleMassKg: number
  centreOfGravityHeightM: number
  tyreFrictionCoefficient: number
  roadCondition: 'Dry' | 'Wet' | 'Snow' | 'Ice'
}
export type PerformanceParameters = {
  motorPowerKw: number
  motorTorqueNm: number
  vehicleMassKg: number
  gearRatio: number
  maximumRpm: number
  tyreRadiusM: number
  driveType: 'FWD' | 'RWD' | 'AWD'
}
export type EnergyRangeParameters = {
  batteryCapacityKwh: number
  stateOfChargePct: number
  motorEfficiencyPct: number
  vehicleSpeedKph: number
  vehicleMassKg: number
  drivingCycle: 'City' | 'Mixed' | 'Highway'
  auxiliaryPowerKw: number
}

export type SimulationConfigurations = {
  Aerodynamics: AerodynamicsParameters
  'Thermal Analysis': ThermalParameters
  'Structural Analysis': StructuralParameters
  'Vehicle Dynamics': VehicleDynamicsParameters
  Performance: PerformanceParameters
  'Energy & Range': EnergyRangeParameters
}

export type SimulationField = {
  key: string
  label: string
  unit?: string
  min?: number
  max?: number
  step?: number
  options?: readonly string[]
}

export const simulationFields: Record<SimulationType, readonly SimulationField[]> = {
  Aerodynamics: [
    { key: 'vehicleSpeedKph', label: 'Vehicle speed', unit: 'km/h', min: 1, max: 350, step: 1 },
    { key: 'airDensityKgM3', label: 'Air density', unit: 'kg/m³', min: .5, max: 1.6, step: .001 },
    { key: 'frontalAreaM2', label: 'Frontal area', unit: 'm²', min: .5, max: 6, step: .01 },
    { key: 'dragCoefficient', label: 'Drag coefficient', unit: 'Cd', min: .05, max: 1.5, step: .01 },
    { key: 'windSpeedKph', label: 'Wind speed', unit: 'km/h', min: 0, max: 150, step: 1 },
    { key: 'yawAngleDeg', label: 'Yaw angle', unit: '°', min: -45, max: 45, step: .5 },
  ],
  'Thermal Analysis': [
    { key: 'ambientTemperatureC', label: 'Ambient temperature', unit: '°C', min: -40, max: 60, step: 1 },
    { key: 'coolantTemperatureC', label: 'Coolant temperature', unit: '°C', min: -30, max: 120, step: 1 },
    { key: 'coolantFlowKgS', label: 'Coolant flow rate', unit: 'kg/s', min: .05, max: 5, step: .05 },
    { key: 'motorTemperatureC', label: 'Motor temperature', unit: '°C', min: -20, max: 250, step: 1 },
    { key: 'batteryTemperatureC', label: 'Battery temperature', unit: '°C', min: -20, max: 100, step: 1 },
    { key: 'heatGenerationKw', label: 'Heat generation', unit: 'kW', min: 0, max: 300, step: .5 },
  ],
  'Structural Analysis': [
    { key: 'appliedLoadKn', label: 'Applied load', unit: 'kN', min: .1, max: 500, step: .1 },
    { key: 'material', label: 'Material', options: ['Carbon fiber', 'Aluminium alloy', 'Steel', 'Titanium alloy'] },
    { key: 'youngsModulusGPa', label: "Young's modulus", unit: 'GPa', min: 1, max: 500, step: 1 },
    { key: 'poissonsRatio', label: "Poisson's ratio", min: .1, max: .49, step: .01 },
    { key: 'vehicleMassKg', label: 'Vehicle mass', unit: 'kg', min: 300, max: 5000, step: 10 },
    { key: 'forceDirection', label: 'Force direction', options: ['Axial', 'Lateral', 'Torsional'] },
    { key: 'boundaryConditions', label: 'Boundary conditions', options: ['Fixed ends', 'Simply supported', 'Cantilever'] },
  ],
  'Vehicle Dynamics': [
    { key: 'vehicleSpeedKph', label: 'Vehicle speed', unit: 'km/h', min: 0, max: 300, step: 1 },
    { key: 'steeringAngleDeg', label: 'Steering angle', unit: '°', min: -45, max: 45, step: .5 },
    { key: 'wheelbaseM', label: 'Wheelbase', unit: 'm', min: 1.5, max: 4, step: .01 },
    { key: 'vehicleMassKg', label: 'Vehicle mass', unit: 'kg', min: 300, max: 5000, step: 10 },
    { key: 'centreOfGravityHeightM', label: 'Centre of gravity height', unit: 'm', min: .2, max: 2, step: .01 },
    { key: 'tyreFrictionCoefficient', label: 'Tyre friction coefficient', unit: 'μ', min: .05, max: 2, step: .01 },
    { key: 'roadCondition', label: 'Road condition', options: ['Dry', 'Wet', 'Snow', 'Ice'] },
  ],
  Performance: [
    { key: 'motorPowerKw', label: 'Motor power', unit: 'kW', min: 1, max: 1500, step: 1 },
    { key: 'motorTorqueNm', label: 'Motor torque', unit: 'Nm', min: 1, max: 3000, step: 1 },
    { key: 'vehicleMassKg', label: 'Vehicle mass', unit: 'kg', min: 300, max: 5000, step: 10 },
    { key: 'gearRatio', label: 'Gear ratio', unit: ':1', min: 1, max: 25, step: .1 },
    { key: 'maximumRpm', label: 'Maximum RPM', unit: 'rpm', min: 1000, max: 30000, step: 100 },
    { key: 'tyreRadiusM', label: 'Tyre radius', unit: 'm', min: .2, max: .6, step: .005 },
    { key: 'driveType', label: 'Drive type', options: ['FWD', 'RWD', 'AWD'] },
  ],
  'Energy & Range': [
    { key: 'batteryCapacityKwh', label: 'Battery capacity', unit: 'kWh', min: 5, max: 250, step: 1 },
    { key: 'stateOfChargePct', label: 'State of charge', unit: '%', min: 1, max: 100, step: 1 },
    { key: 'motorEfficiencyPct', label: 'Motor efficiency', unit: '%', min: 50, max: 99, step: .5 },
    { key: 'vehicleSpeedKph', label: 'Vehicle speed', unit: 'km/h', min: 1, max: 250, step: 1 },
    { key: 'vehicleMassKg', label: 'Vehicle mass', unit: 'kg', min: 300, max: 5000, step: 10 },
    { key: 'drivingCycle', label: 'Driving cycle', options: ['City', 'Mixed', 'Highway'] },
    { key: 'auxiliaryPowerKw', label: 'Auxiliary power use', unit: 'kW', min: 0, max: 15, step: .1 },
  ],
}

const calculationVersion = 'veytrix-concept-simulations-1.0.0'
const gravity = 9.80665
const positive = (value: number, label: string) => {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be greater than zero.`)
}
const result = (metrics: SimulationMetric[], assumptions: string[]): SimulationCalculation => ({
  metrics,
  assumptions,
  status: 'Estimated',
  calculationVersion,
})

export function calculateAerodynamics(input: AerodynamicsParameters): SimulationCalculation {
  positive(input.vehicleSpeedKph, 'Vehicle speed')
  positive(input.airDensityKgM3, 'Air density')
  positive(input.frontalAreaM2, 'Frontal area')
  positive(input.dragCoefficient, 'Drag coefficient')
  const yaw = input.yawAngleDeg * Math.PI / 180
  const longitudinalAirSpeed = input.vehicleSpeedKph / 3.6 + input.windSpeedKph / 3.6 * Math.cos(yaw)
  const lateralAirSpeed = input.windSpeedKph / 3.6 * Math.sin(yaw)
  const relativeAirSpeed = Math.hypot(longitudinalAirSpeed, lateralAirSpeed)
  const dynamicPressure = .5 * input.airDensityKgM3 * relativeAirSpeed ** 2
  const dragForce = dynamicPressure * input.dragCoefficient * input.frontalAreaM2
  return result([
    { label: 'Relative air speed', value: relativeAirSpeed * 3.6, unit: 'km/h' },
    { label: 'Dynamic pressure', value: dynamicPressure, unit: 'Pa' },
    { label: 'Estimated drag force', value: dragForce, unit: 'N' },
    { label: 'Drag power at vehicle speed', value: dragForce * (input.vehicleSpeedKph / 3.6) / 1000, unit: 'kW' },
  ], ['Steady relative-wind vector and Fd = ½ρCdAv².', 'Supplied frontal area and drag coefficient are treated as fixed; no CFD, ground effect, cooling flow, or lift model.'])
}

export function calculateThermalAnalysis(input: ThermalParameters): SimulationCalculation {
  positive(input.coolantFlowKgS, 'Coolant flow rate')
  const coolantSpecificHeatJkgK = 4180
  const heatGenerationW = input.heatGenerationKw * 1000
  const coolantTemperatureRise = heatGenerationW / (input.coolantFlowKgS * coolantSpecificHeatJkgK)
  const coolantOutlet = input.coolantTemperatureC + coolantTemperatureRise
  return result([
    { label: 'Coolant outlet estimate', value: coolantOutlet, unit: '°C' },
    { label: 'Coolant temperature rise', value: coolantTemperatureRise, unit: '°C' },
    { label: 'Motor to ambient difference', value: input.motorTemperatureC - input.ambientTemperatureC, unit: '°C' },
    { label: 'Battery to ambient difference', value: input.batteryTemperatureC - input.ambientTemperatureC, unit: '°C' },
    { label: 'Heat carried by coolant', value: Math.min(heatGenerationW, input.coolantFlowKgS * coolantSpecificHeatJkgK * Math.max(0, 90 - input.coolantTemperatureC)) / 1000, unit: 'kW' },
  ], ['Coolant is modeled as water-glycol with constant specific heat 4.18 kJ/(kg·K).', 'Assumes all entered heat reaches the coolant; no component thermal mass, heat transfer resistance, radiator, transient behavior, or validated limits.'])
}

export function calculateStructuralAnalysis(input: StructuralParameters): SimulationCalculation {
  positive(input.appliedLoadKn, 'Applied load')
  positive(input.youngsModulusGPa, "Young's modulus")
  positive(input.vehicleMassKg, 'Vehicle mass')
  const areaM2 = .015
  const directionFactor = input.forceDirection === 'Torsional' ? 1.3 : input.forceDirection === 'Lateral' ? 1.15 : 1
  const boundaryFactor = input.boundaryConditions === 'Cantilever' ? 1.5 : input.boundaryConditions === 'Fixed ends' ? 1.25 : 1
  const stressPa = input.appliedLoadKn * 1000 / areaM2 * directionFactor * boundaryFactor
  const modulusPa = input.youngsModulusGPa * 1e9
  const allowableMpa: Record<StructuralParameters['material'], number> = {
    'Carbon fiber': 500,
    'Aluminium alloy': 275,
    Steel: 350,
    'Titanium alloy': 880,
  }
  const axialStrain = stressPa / modulusPa
  return result([
    { label: 'Illustrative stress', value: stressPa / 1e6, unit: 'MPa' },
    { label: 'Axial strain estimate', value: axialStrain * 1e6, unit: 'με' },
    { label: 'Shear modulus', value: input.youngsModulusGPa / (2 * (1 + input.poissonsRatio)), unit: 'GPa' },
    { label: 'Indicative load ratio', value: stressPa / 1e6 / allowableMpa[input.material] * 100, unit: '%' },
    { label: 'Vehicle mass input', value: input.vehicleMassKg, unit: 'kg' },
  ], ['Uses a fixed representative section area of 0.015 m² and simplified direction/boundary multipliers.', 'Material allowables are illustrative screening values only. No mesh, geometry, joints, buckling, fatigue, nonlinear behavior, or FEA solver is included.'])
}

export function calculateVehicleDynamics(input: VehicleDynamicsParameters): SimulationCalculation {
  positive(input.wheelbaseM, 'Wheelbase')
  positive(input.vehicleMassKg, 'Vehicle mass')
  positive(input.centreOfGravityHeightM, 'Centre of gravity height')
  const speedMps = input.vehicleSpeedKph / 3.6
  const steeringRadians = input.steeringAngleDeg * Math.PI / 180
  const turnRadius = Math.abs(steeringRadians) < .001 ? Infinity : input.wheelbaseM / Math.abs(Math.tan(steeringRadians))
  const lateralAcceleration = Number.isFinite(turnRadius) ? speedMps ** 2 / turnRadius : 0
  const roadMultiplier: Record<VehicleDynamicsParameters['roadCondition'], number> = { Dry: 1, Wet: .65, Snow: .25, Ice: .1 }
  const availableTraction = input.tyreFrictionCoefficient * roadMultiplier[input.roadCondition] * gravity
  const assumedTrackWidthM = 1.62
  const rolloverLimit = gravity * assumedTrackWidthM / (2 * input.centreOfGravityHeightM)
  const lateralLimit = Math.min(availableTraction, rolloverLimit)
  return result([
    { label: 'Steady turn radius', value: Number.isFinite(turnRadius) ? turnRadius : 'Straight line', unit: Number.isFinite(turnRadius) ? 'm' : '' },
    { label: 'Lateral acceleration demand', value: lateralAcceleration, unit: 'm/s²' },
    { label: 'Lateral force demand', value: input.vehicleMassKg * lateralAcceleration, unit: 'N' },
    { label: 'Road-adjusted traction limit', value: availableTraction, unit: 'm/s²' },
    { label: 'Estimated lateral limit', value: lateralLimit, unit: 'm/s²' },
  ], ['Uses a bicycle-model turn radius, a 1.62 m assumed track width, and road multipliers Dry 1.0, Wet 0.65, Snow 0.25, Ice 0.1.', 'No suspension kinematics, tire model, transient yaw response, load transfer, ESC, or measured road data.'])
}

export function calculatePerformance(input: PerformanceParameters): SimulationCalculation {
  positive(input.motorPowerKw, 'Motor power')
  positive(input.motorTorqueNm, 'Motor torque')
  positive(input.vehicleMassKg, 'Vehicle mass')
  positive(input.gearRatio, 'Gear ratio')
  positive(input.maximumRpm, 'Maximum RPM')
  positive(input.tyreRadiusM, 'Tyre radius')
  const driveEfficiency: Record<PerformanceParameters['driveType'], number> = { FWD: .93, RWD: .94, AWD: .9 }
  const efficiency = driveEfficiency[input.driveType]
  const torqueAtMaximumRpmNm = input.motorPowerKw * 9550 / input.maximumRpm
  const usableMotorTorqueNm = Math.min(input.motorTorqueNm, torqueAtMaximumRpmNm)
  const wheelTorqueNm = usableMotorTorqueNm * input.gearRatio * efficiency
  const tractiveForceN = wheelTorqueNm / input.tyreRadiusM
  const wheelRpm = input.maximumRpm / input.gearRatio
  const speedKph = wheelRpm * 2 * Math.PI * input.tyreRadiusM / 60 * 3.6
  return result([
    { label: 'Wheel torque estimate', value: wheelTorqueNm, unit: 'Nm' },
    { label: 'Peak tractive force', value: tractiveForceN, unit: 'N' },
    { label: 'Power-to-mass ratio', value: input.motorPowerKw * 1000 / input.vehicleMassKg, unit: 'W/kg' },
    { label: 'RPM-limited speed', value: speedKph, unit: 'km/h' },
    { label: 'Drive type', value: input.driveType, unit: '' },
  ], [`Uses a fixed driveline efficiency by drive type (${Math.round(efficiency * 100)}%) and a single gear ratio.`, 'Speed is limited by entered maximum RPM and tire radius. No motor map, shift logic, tire traction, aerodynamic load, or drivetrain dynamics.'])
}

export function calculateEnergyRange(input: EnergyRangeParameters): SimulationCalculation {
  positive(input.batteryCapacityKwh, 'Battery capacity')
  positive(input.vehicleSpeedKph, 'Vehicle speed')
  positive(input.vehicleMassKg, 'Vehicle mass')
  positive(input.motorEfficiencyPct, 'Motor efficiency')
  const speedMps = input.vehicleSpeedKph / 3.6
  const airDensityKgM3 = 1.225
  const assumedCd = .26
  const assumedAreaM2 = 2.4
  const rollingCoefficient = .012
  const cycleFactor: Record<EnergyRangeParameters['drivingCycle'], number> = { City: 1.12, Mixed: 1, Highway: 1.18 }
  const dragN = .5 * airDensityKgM3 * assumedCd * assumedAreaM2 * speedMps ** 2
  const rollingN = rollingCoefficient * input.vehicleMassKg * gravity
  const roadEnergyKwhPer100Km = (dragN + rollingN) * 100_000 / 3_600_000 / (input.motorEfficiencyPct / 100) * cycleFactor[input.drivingCycle]
  const auxiliaryEnergyKwhPer100Km = input.auxiliaryPowerKw / input.vehicleSpeedKph * 100
  const consumption = roadEnergyKwhPer100Km + auxiliaryEnergyKwhPer100Km
  const usableEnergyKwh = input.batteryCapacityKwh * input.stateOfChargePct / 100
  return result([
    { label: 'Usable energy at entered SOC', value: usableEnergyKwh, unit: 'kWh' },
    { label: 'Estimated consumption', value: consumption, unit: 'kWh/100 km' },
    { label: 'Auxiliary energy', value: auxiliaryEnergyKwhPer100Km, unit: 'kWh/100 km' },
    { label: 'Estimated driving range', value: usableEnergyKwh / consumption * 100, unit: 'km' },
  ], [`Constant-speed road-load estimate with assumed Cd ${assumedCd}, frontal area ${assumedAreaM2} m², rolling coefficient ${rollingCoefficient}, and air density ${airDensityKgM3} kg/m³.`, `Driving-cycle multiplier is illustrative (${input.drivingCycle}: ${cycleFactor[input.drivingCycle]}). No traffic trace, elevation, weather, aging, regen, or validated cycle is modeled.`])
}

export function calculateSimulation(type: 'Aerodynamics', input: AerodynamicsParameters): SimulationCalculation
export function calculateSimulation(type: 'Thermal Analysis', input: ThermalParameters): SimulationCalculation
export function calculateSimulation(type: 'Structural Analysis', input: StructuralParameters): SimulationCalculation
export function calculateSimulation(type: 'Vehicle Dynamics', input: VehicleDynamicsParameters): SimulationCalculation
export function calculateSimulation(type: 'Performance', input: PerformanceParameters): SimulationCalculation
export function calculateSimulation(type: 'Energy & Range', input: EnergyRangeParameters): SimulationCalculation
export function calculateSimulation(type: SimulationType, input: SimulationConfigurations[SimulationType]): SimulationCalculation {
  switch (type) {
    case 'Aerodynamics': return calculateAerodynamics(input as AerodynamicsParameters)
    case 'Thermal Analysis': return calculateThermalAnalysis(input as ThermalParameters)
    case 'Structural Analysis': return calculateStructuralAnalysis(input as StructuralParameters)
    case 'Vehicle Dynamics': return calculateVehicleDynamics(input as VehicleDynamicsParameters)
    case 'Performance': return calculatePerformance(input as PerformanceParameters)
    case 'Energy & Range': return calculateEnergyRange(input as EnergyRangeParameters)
  }
}

export function calculateSimulationForType(type: SimulationType, inputs: SimulationConfigurations): SimulationCalculation {
  switch (type) {
    case 'Aerodynamics': return calculateAerodynamics(inputs.Aerodynamics)
    case 'Thermal Analysis': return calculateThermalAnalysis(inputs['Thermal Analysis'])
    case 'Structural Analysis': return calculateStructuralAnalysis(inputs['Structural Analysis'])
    case 'Vehicle Dynamics': return calculateVehicleDynamics(inputs['Vehicle Dynamics'])
    case 'Performance': return calculatePerformance(inputs.Performance)
    case 'Energy & Range': return calculateEnergyRange(inputs['Energy & Range'])
  }
}

type SimulationProjectDefaults = {
  targets?: { battery?: number; drag?: number }
  dimensions?: { length?: number; width?: number; height?: number }
  material?: string
}

export function createSimulationDefaults(project?: SimulationProjectDefaults): SimulationConfigurations {
  const width = project?.dimensions?.width ?? 1.9
  const height = project?.dimensions?.height ?? 1.4
  const materialDefaults: Record<string, { modulus: number; poisson: number }> = {
    'Carbon Fiber': { modulus: 70, poisson: .28 },
    'Aluminium Alloy': { modulus: 72, poisson: .33 },
    'Titanium Alloy': { modulus: 114, poisson: .34 },
    'Magnesium Alloy': { modulus: 45, poisson: .35 },
    'High-Strength Steel': { modulus: 210, poisson: .3 },
  }
  const material = project?.material ?? 'Carbon Fiber'
  const materialChoice = material.includes('Aluminium') ? 'Aluminium alloy' : material.includes('Titanium') ? 'Titanium alloy' : material.includes('Steel') ? 'Steel' : 'Carbon fiber'
  const structuralMaterial = materialDefaults[material] ?? materialDefaults['Carbon Fiber']
  return {
    Aerodynamics: { vehicleSpeedKph: 100, airDensityKgM3: 1.225, frontalAreaM2: width * height * .82, dragCoefficient: project?.targets?.drag ?? .26, windSpeedKph: 0, yawAngleDeg: 0 },
    'Thermal Analysis': { ambientTemperatureC: 22, coolantTemperatureC: 30, coolantFlowKgS: .8, motorTemperatureC: 75, batteryTemperatureC: 31, heatGenerationKw: 12 },
    'Structural Analysis': { appliedLoadKn: 18, material: materialChoice as StructuralParameters['material'], youngsModulusGPa: structuralMaterial.modulus, poissonsRatio: structuralMaterial.poisson, vehicleMassKg: 1680, forceDirection: 'Axial', boundaryConditions: 'Simply supported' },
    'Vehicle Dynamics': { vehicleSpeedKph: 80, steeringAngleDeg: 12, wheelbaseM: (project?.dimensions?.length ?? 4.6) * .62, vehicleMassKg: 1680, centreOfGravityHeightM: .56, tyreFrictionCoefficient: .9, roadCondition: 'Dry' },
    Performance: { motorPowerKw: 210, motorTorqueNm: 420, vehicleMassKg: 1680, gearRatio: 9, maximumRpm: 16000, tyreRadiusM: .34, driveType: 'AWD' },
    'Energy & Range': { batteryCapacityKwh: project?.targets?.battery ?? 82, stateOfChargePct: 80, motorEfficiencyPct: 90, vehicleSpeedKph: 100, vehicleMassKg: 1680, drivingCycle: 'Mixed', auxiliaryPowerKw: 1.5 },
  }
}
