from flask import Blueprint, jsonify, request

from app.engineering.aerodynamics.calculations import aerodynamic_drag
from app.engineering.energy.calculations import energy_and_range

engineering_api = Blueprint("engineering_api", __name__)
MODEL_VERSION = "veytrix-concept-1.0.0"


def number_field(payload: dict, name: str, *, minimum: float, maximum: float) -> float:
    value = payload.get(name)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be numeric.")
    if not minimum <= float(value) <= maximum:
        raise ValueError(f"{name} must be between {minimum} and {maximum}.")
    return float(value)


def json_input() -> dict:
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        raise ValueError("Send a JSON object.")
    return payload


@engineering_api.post("/aerodynamics")
def calculate_aerodynamics():
    try:
        payload = json_input()
        cd = number_field(payload, "drag_coefficient", minimum=0.05, maximum=2.0)
        area = number_field(payload, "frontal_area_m2", minimum=0.1, maximum=20.0)
        speed = number_field(payload, "speed_kph", minimum=0.0, maximum=500.0)
        output = aerodynamic_drag(cd, area, speed)
        return jsonify({
            "value": output,
            "unit": "N",
            "status": "calculated",
            "calculation_version": MODEL_VERSION,
            "assumptions": ["Steady incompressible flow.", "Air density = 1.225 kg/m³."],
            "limitations": ["Uses supplied Cd and frontal area; this is not CFD."],
        })
    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400


@engineering_api.post("/energy-range")
def calculate_energy_range():
    try:
        payload = json_input()
        mass = number_field(payload, "mass_kg", minimum=100.0, maximum=100_000.0)
        cd = number_field(payload, "drag_coefficient", minimum=0.05, maximum=2.0)
        area = number_field(payload, "frontal_area_m2", minimum=0.1, maximum=20.0)
        speed = number_field(payload, "speed_kph", minimum=1.0, maximum=500.0)
        battery = number_field(payload, "battery_kwh", minimum=0.1, maximum=10_000.0)
        efficiency = number_field(payload, "drivetrain_efficiency", minimum=0.1, maximum=1.0)
        usable_fraction = number_field(payload, "usable_battery_fraction", minimum=0.1, maximum=1.0)
        output = energy_and_range(mass, cd, area, speed, battery, efficiency, usable_fraction)
        return jsonify({
            "value": output,
            "unit": {"consumption": "kWh/100 km", "range": "km"},
            "status": "estimated",
            "calculation_version": MODEL_VERSION,
            "assumptions": ["Constant-speed, level-road road load.", "Aerodynamic drag and rolling resistance only."],
            "limitations": ["Excludes grade, traffic, weather, accessories, aging, and driving cycles."],
        })
    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400
