export type EngineeringApiResult<T> = {
  value: T
  unit: string | Record<string, string>
  status: 'calculated' | 'estimated' | 'externally-validated'
  calculation_version: string
  assumptions: string[]
  limitations: string[]
}

const baseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').trim().replace(/\/$/, '')

async function post<TInput extends Record<string, number>, TOutput>(
  path: string,
  input: TInput,
  signal?: AbortSignal,
): Promise<EngineeringApiResult<TOutput>> {
  if (!baseUrl) throw new Error('VEYTRIX API is not configured. Set VITE_API_BASE_URL to a deployed Flask API endpoint; GitHub Pages does not host the backend.')
  let response: Response
  try {
    response = await fetch(baseUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error('VEYTRIX API is unreachable. Start the Flask backend or use the local concept preview.')
  }
  const body = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Engineering API request failed (' + response.status + ').')
  return body as unknown as EngineeringApiResult<TOutput>
}

export const engineeringApi = {
  aerodynamicDrag: (input: { drag_coefficient: number; frontal_area_m2: number; speed_kph: number }, signal?: AbortSignal) =>
    post<typeof input, number>('/engineering/aerodynamics', input, signal),
  energyAndRange: (input: {
    mass_kg: number
    drag_coefficient: number
    frontal_area_m2: number
    speed_kph: number
    battery_kwh: number
    drivetrain_efficiency: number
    usable_battery_fraction: number
  }, signal?: AbortSignal) => post<typeof input, { consumption_kwh_per_100_km: number; range_km: number }>('/engineering/energy-range', input, signal),
}
