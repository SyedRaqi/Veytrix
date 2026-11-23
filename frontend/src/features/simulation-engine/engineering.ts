/**
 * Concept-stage vehicle calculations. SI units are used internally:
 * kg, m, s, N, W, J, Pa. These estimates are not CFD, FEA, certification,
 * supplier data, or safety evidence.
 */
export const CALCULATION_VERSION = 'veytrix-concept-1.0.0'
export const G = 9.80665
export const RHO_AIR = 1.225
export const DEFAULT_CRR = 0.012

export type VehicleInputs = {
  massKg: number
  frontalAreaM2: number
  dragCoefficient: number
  speedKph: number
  batteryKWh: number
  drivetrainEfficiency?: number
  usableBatteryFraction?: number
}

export type EngineeringResult<T> = {
  value: T
  unit: string
  status: 'calculated' | 'estimated'
  calculationVersion: string
  assumptions: string[]
  limitations: string[]
}

export const convert = {
  kphToMps: (value: number) => value / 3.6,
  mpsToKph: (value: number) => value * 3.6,
  kwToW: (value: number) => value * 1000,
  joulesToKWh: (value: number) => value / 3_600_000,
}

function assertPositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(label + ' must be positive.')
}

function wrap<T>(value: T, unit: string, status: EngineeringResult<T>['status'], assumptions: string[], limitations: string[]): EngineeringResult<T> {
  return { value, unit, status, calculationVersion: CALCULATION_VERSION, assumptions, limitations }
}

export function estimateMass(massKg: number) {
  assertPositive(massKg, 'Mass')
  return wrap(massKg, 'kg', 'estimated', ['Uses the project mass input as a concept estimate.'], ['Not derived from CAD, detailed BOM, manufacturing tolerances, or measured components.'])
}

export function calculateAerodynamicDrag(input: Pick<VehicleInputs, 'dragCoefficient' | 'frontalAreaM2' | 'speedKph'>) {
  assertPositive(input.frontalAreaM2, 'Frontal area')
  if (input.dragCoefficient < 0.05 || input.dragCoefficient > 2) throw new Error('Cd must be between 0.05 and 2.')
  const speed = convert.kphToMps(input.speedKph)
  const forceN = 0.5 * RHO_AIR * input.dragCoefficient * input.frontalAreaM2 * speed * speed
  return wrap(forceN, 'N', 'calculated', ['Fd = 0.5 × rho × Cd × A × v²; air density = 1.225 kg/m³.'], ['Assumes steady flow and supplied Cd and area; no yaw, wind, ground effect, or cooling flow. Not CFD.'])
}

export function calculateRollingResistance(massKg: number, coefficient = DEFAULT_CRR) {
  assertPositive(massKg, 'Mass')
  if (coefficient < 0.001 || coefficient > 0.1) throw new Error('Rolling resistance coefficient must be between 0.001 and 0.1.')
  return wrap(coefficient * massKg * G, 'N', 'estimated', ['Frr = Crr × m × g on a level road; g = 9.80665 m/s².'], ['Tire, road, pressure, temperature, and bearing effects are not modeled.'])
}

export function estimateEnergyAndRange(input: VehicleInputs) {
  assertPositive(input.massKg, 'Mass')
  assertPositive(input.frontalAreaM2, 'Frontal area')
  assertPositive(input.batteryKWh, 'Battery capacity')
  assertPositive(input.speedKph, 'Speed')
  if (input.dragCoefficient < 0.05 || input.dragCoefficient > 2) throw new Error('Cd must be between 0.05 and 2.')
  const efficiency = input.drivetrainEfficiency ?? 0.9
  const usable = input.usableBatteryFraction ?? 0.9
  if (efficiency <= 0 || efficiency > 1 || usable <= 0 || usable > 1) throw new Error('Efficiency and usable battery fraction must be in (0, 1].')
  const speed = convert.kphToMps(input.speedKph)
  const drag = 0.5 * RHO_AIR * input.dragCoefficient * input.frontalAreaM2 * speed * speed
  const rolling = DEFAULT_CRR * input.massKg * G
  const kWhPer100Km = (drag + rolling) * 100_000 / 3_600_000 / efficiency
  const rangeKm = input.batteryKWh * usable / kWhPer100Km * 100
  return wrap({ kWhPer100Km, rangeKm }, 'kWh/100 km, km', 'estimated', ['Constant-speed, level-road energy balance from aerodynamic drag and rolling resistance.'], ['Excludes grade, traffic, accessory loads, weather, tires, aging, regenerative braking, and drive cycles.'])
}

export function estimateBatteryCapacity(targetRangeKm: number, consumptionKWhPer100Km: number, usableFraction = 0.9) {
  assertPositive(targetRangeKm, 'Target range')
  assertPositive(consumptionKWhPer100Km, 'Consumption')
  if (usableFraction <= 0 || usableFraction > 1) throw new Error('Usable fraction must be in (0, 1].')
  return wrap(targetRangeKm * consumptionKWhPer100Km / 100 / usableFraction, 'kWh', 'estimated', ['Capacity = range × consumption / usable fraction.'], ['Result quality depends on the assumed drive cycle, consumption, battery limits, and aging.'])
}

export function estimateMotorPower(input: VehicleInputs, accelerationMps2 = 0) {
  if (input.drivetrainEfficiency !== undefined && (input.drivetrainEfficiency <= 0 || input.drivetrainEfficiency > 1)) throw new Error('Drivetrain efficiency must be in (0, 1].')
  const drag = calculateAerodynamicDrag(input).value
  const rolling = calculateRollingResistance(input.massKg).value
  const speedMps = convert.kphToMps(input.speedKph)
  const acceleration = input.massKg * Math.max(0, accelerationMps2)
  const efficiency = input.drivetrainEfficiency ?? 0.9
  const wheelKw = (drag + rolling + acceleration) * speedMps / 1000
  const motorKw = wheelKw / efficiency
  const assumedRpm = 9000
  const torqueNm = motorKw * 1000 / (assumedRpm * 2 * Math.PI / 60)
  return wrap({ motorKw, wheelKw, torqueNm }, 'kW, Nm', 'estimated', ['P = road-load force × speed; power is divided by assumed drivetrain efficiency.', 'Torque uses an illustrative 9000 rpm motor operating point.'], ['Ignores gear ratios, torque curve, traction, rotating inertia, grade, thermal limits, and transient control.'])
}

export function estimateMaximumSpeed(input: Omit<VehicleInputs, 'speedKph' | 'batteryKWh'> & { motorPowerKw: number }) {
  assertPositive(input.massKg, 'Mass')
  assertPositive(input.frontalAreaM2, 'Frontal area')
  assertPositive(input.motorPowerKw, 'Motor power')
  if (input.dragCoefficient < 0.05 || input.dragCoefficient > 2) throw new Error('Cd must be between 0.05 and 2.')
  let low = 0
  let high = 150
  const efficiency = input.drivetrainEfficiency ?? 0.9
  if (efficiency <= 0 || efficiency > 1) throw new Error('Drivetrain efficiency must be in (0, 1].')
  for (let i = 0; i < 60; i += 1) {
    const speed = (low + high) / 2
    const resistance = 0.5 * RHO_AIR * input.dragCoefficient * input.frontalAreaM2 * speed * speed + DEFAULT_CRR * input.massKg * G
    if (resistance * speed > input.motorPowerKw * 1000 * efficiency) high = speed
    else low = speed
  }
  return wrap(convert.mpsToKph(low), 'km/h', 'estimated', ['Solves steady level-road road-load power equals available wheel power.'], ['Does not include gear limits, motor power curves, tire limits, grade, wind, or thermal derating.'])
}

export function comparePerformance(current: { rangeKm: number; massKg: number; energyKWhPer100Km: number }, candidate: { rangeKm: number; massKg: number; energyKWhPer100Km: number }) {
  return wrap({
    rangeDeltaKm: candidate.rangeKm - current.rangeKm,
    massDeltaKg: candidate.massKg - current.massKg,
    energyDeltaKWhPer100Km: candidate.energyKWhPer100Km - current.energyKWhPer100Km,
  }, 'km, kg, kWh/100 km', 'calculated', ['Reports arithmetic deltas between the two supplied configurations.'], ['Does not validate either input configuration or infer causality.'])
}
