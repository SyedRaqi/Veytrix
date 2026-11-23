GRAVITY_M_S2 = 9.80665
ROLLING_RESISTANCE_COEFFICIENT = 0.012
AIR_DENSITY_KG_M3 = 1.225


def energy_and_range(
    mass_kg: float,
    drag_coefficient: float,
    frontal_area_m2: float,
    speed_kph: float,
    battery_kwh: float,
    drivetrain_efficiency: float,
    usable_battery_fraction: float,
) -> dict[str, float]:
    """Estimate flat-road constant-speed consumption and range; outputs are not drive-cycle results."""
    speed_mps = speed_kph / 3.6
    drag_n = 0.5 * AIR_DENSITY_KG_M3 * drag_coefficient * frontal_area_m2 * speed_mps**2
    rolling_n = ROLLING_RESISTANCE_COEFFICIENT * mass_kg * GRAVITY_M_S2
    wheel_kwh_per_100_km = (drag_n + rolling_n) * 100_000 / 3_600_000
    consumption = wheel_kwh_per_100_km / drivetrain_efficiency
    usable_energy = battery_kwh * usable_battery_fraction
    return {
        "consumption_kwh_per_100_km": consumption,
        "range_km": usable_energy / consumption * 100,
    }
