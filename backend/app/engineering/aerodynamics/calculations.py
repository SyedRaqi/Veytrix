AIR_DENSITY_KG_M3 = 1.225


def aerodynamic_drag(drag_coefficient: float, frontal_area_m2: float, speed_kph: float) -> float:
    """Return steady aerodynamic drag in newtons: 0.5 * rho * Cd * A * v**2."""
    speed_mps = speed_kph / 3.6
    return 0.5 * AIR_DENSITY_KG_M3 * drag_coefficient * frontal_area_m2 * speed_mps**2
