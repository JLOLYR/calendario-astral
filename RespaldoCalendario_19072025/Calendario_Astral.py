from flatlib.chart import Chart
from flatlib import const
OBJECTS_NO_FORTUNE = [obj for obj in const.LIST_OBJECTS if obj not in (const.PARS_FORTUNA, 'Syzygy')]

from Fun_Astral import transform_for_libraries, get_eclipses
import os
import json

# -------SET YEAR-------
AÑO = 2027  # Define aquí el año que deseas generar completamente
Orbe = 0.025 # Orbe de olgura para los aspectos. 
# -------SET TIME & GEOGRAPHIC COORDINATES-------
time_str = '00:00'
timezone_str = '-04:00'
lat_str = '38s44'
lon_str = '72w36'

# Directorio para almacenar JSON mensuales
base_folder = r'E:/JLO/Cosass/Astrología/Fabula_Siderum_SA/Chart_FSCreator/prueba_vectores/CalendarioWebAstral'
folder = os.path.join(base_folder, f'Calendar/{AÑO}')

os.makedirs(folder, exist_ok=True)

def get_chart_for_time(date_str, time_str):
    data = transform_for_libraries(date_str, time_str, timezone_str, lat_str, lon_str)
    flatlib_date = data["flatlib"]["date"]
    flatlib_pos = data["flatlib"]["pos"]
    return Chart(flatlib_date, flatlib_pos, hsys=const.HOUSES_PLACIDUS, IDs=const.LIST_OBJECTS)

def get_planet_info(planet):
    return planet.lon, planet.sign

def get_planet_info1(planet):
    return planet.lon, planet.sign, planet.isRetrograde()

# Aspectos y configuraciones
Ang_Aspect = {"Conjunction": 0, "Opposition": 180, "Trine": 120, "Square": 90, "Sextile": 60}

Eclipse_Orbe = 10

def get_aspects(planets, ang_aspect, orbe):
    results = []
    planet_names = list(planets.keys())
    planet_values = list(planets.values())

    for i in range(len(planet_values)):
        for j in range(i + 1, len(planet_values)):
            for aspect_name, angle in ang_aspect.items():
                difference = abs(planet_values[i][0] - planet_values[j][0]) % 360
                if difference > 180:
                    difference = 360 - difference
                if (angle - orbe) <= difference <= (angle + orbe):
                    results.append({
                        "planet1": planet_names[i],
                        "planet2": planet_names[j],
                        "aspect": aspect_name,
                        "planet1_sign": planet_values[i][1],
                        "planet2_sign": planet_values[j][1]
                    })
    return results

def get_moon_phase(sun_lon, moon_lon):
    angle = (moon_lon - sun_lon) % 360
    phases = [(0, 15, "Luna Nueva"), (45, 90, "Creciente"), (90, 105, "Cuarto Creciente"),
              (135, 180, "Gibosa Creciente"), (180, 195, "Luna Llena"),
              (225, 270, "Gibosa Menguante"), (270, 285, "Cuarto Menguante"),
              (315, 360, "Balsámica")]
    for start, end, phase in phases:
        if start <= angle < end:
            return phase
    return None

from Fun_Astral import get_eclipses

def normalize_date(date_str):
    """Convierte una fecha 'YYYY/MM/DD' o 'YYYY-M-D' a 'YYYY-MM-DD'."""
    parts = date_str.replace('/', '-').split('-')
    year = parts[0]
    month = parts[1].zfill(2)
    day = parts[2].zfill(2)
    return f"{year}-{month}-{day}"



def check_for_eclipse(sun_lon, moon_lon, node_lon):
    solar_diff = abs(sun_lon - moon_lon) % 360
    lunar_diff = abs(sun_lon - moon_lon) % 360
    if solar_diff < Orbe and abs(moon_lon - node_lon) < Eclipse_Orbe:
        return "Eclipse Solar"
    if abs(lunar_diff - 180) < Orbe and abs(moon_lon - node_lon) < Eclipse_Orbe:
        return "Eclipse Lunar"
    return None

for MES in range(1, 13):  # Bucle que genera archivos JSON para cada mes
    monthly_aspects = {}
    retrograde_status = {}
    aspects_found_global = set()
    previous_moon_sign = None

    days_in_month = 31 if MES in [1,3,5,7,8,10,12] else 30 if MES != 2 else 29

    for day in range(1, days_in_month + 1):
        date_str = f'{AÑO}/{MES:02d}/{day:02d}'
        year, month, day_num = AÑO, MES, day
        monthly_aspects.setdefault(year, {}).setdefault(month, {})[day_num] = {
            "Moon": {}, "Aspects": {}, "Moon_Phase": None, "Retrograde_Changes": [], "Eclipse": None
        }

        aspects_found = set()
        chart = get_chart_for_time(date_str, '00:00')
        moon_lon, moon_sign = get_planet_info(chart.get(const.MOON))
        sun_lon = get_planet_info(chart.get(const.SUN))[0]
        node_lon = get_planet_info(chart.get(const.NORTH_NODE))[0]
        moon_phase = get_moon_phase(sun_lon, moon_lon)
        eclipse = check_for_eclipse(sun_lon, moon_lon, node_lon)

        monthly_aspects[year][month][day_num]['Moon_Phase'] = moon_phase
        if eclipse:
            monthly_aspects[year][month][day_num]['Eclipse'] = eclipse

        # NUEVO: Verificación de eclipses usando get_eclipses
        # Verificación con get_eclipses (sobrescribe si es más detallado)
        eclipses_today = get_eclipses(year=year, month=month)
        target_date = normalize_date(date_str)
        for eclipse in eclipses_today:
            if eclipse["date"] == target_date:
                monthly_aspects[year][month][day_num]['Eclipse'] = {
                    "type": eclipse["type"],
                    "subtype": eclipse["subtype"]
                }
 

        monthly_aspects[year][month][day_num]['Moon'] = moon_sign
        previous_moon_sign = moon_sign

        transit_planets = {name: get_planet_info1(chart.get(name)) for name in OBJECTS_NO_FORTUNE}

        for hour in range(24):
            for minute in [0, 15, 30, 45]:
                time_str = f"{hour:02d}:{minute:02d}"
                chart = get_chart_for_time(date_str, time_str)
                planets = {name: get_planet_info(chart.get(name)) for name in OBJECTS_NO_FORTUNE}

                moon_lon, moon_sign = planets["Moon"]
                if previous_moon_sign != moon_sign:
                    previous_moon_sign = moon_sign
                    monthly_aspects[year][month][day_num]['Moon'] = f'CHANGE {moon_sign}'

                aspects_result = get_aspects(planets, Ang_Aspect, Orbe)

                for aspect in aspects_result:
                    aspect_key = (aspect['planet1'], aspect['planet2'], aspect['aspect'])
                    if aspect_key not in aspects_found_global:
                        aspects_found_global.add(aspect_key)
                        monthly_aspects[year][month][day_num]['Aspects'].setdefault(aspect['planet1'], {})[aspect['planet2']] = {
                            "type": aspect['aspect'],
                            "planet1_sign": aspect['planet1_sign'],
                            "planet2_sign": aspect['planet2_sign']
                        }

        for planet_name, (_, _, is_retrograde) in transit_planets.items():
            prev_status = retrograde_status.get(planet_name, is_retrograde)
            if prev_status != is_retrograde:
                status_change = "retrograde" if is_retrograde else "direct"
                monthly_aspects[year][month][day_num]['Retrograde_Changes'].append({
                    "planet": planet_name, "status": status_change
                })
            retrograde_status[planet_name] = is_retrograde

    output_filename = f'{folder}/astro_data_{AÑO}_{MES:02d}.json'
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(monthly_aspects, f, ensure_ascii=False, indent=4)

    print(f"Guardado exitosamente: '{output_filename}'")
