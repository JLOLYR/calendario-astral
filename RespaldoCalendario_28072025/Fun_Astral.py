import numpy as np
import math
import pandas as pd
import os
import time

from datetime import datetime
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib import const
from flatlib.chart import Chart


#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCION FOR ASPECT: Aspect (Planets, Ang_Aspect, Orbe, Rept) 	
# Planets: Planets array; Ang_Aspect: Angle for the aspect, example: opossition = 180; Orbe: Range of maximum and minimum for the aspect; Rept: repetition of the angle
#---------------------------------------------------------------------------------------------------------------------------------------

def Aspect (Planets, Ang_Aspect, Orbe, Rept): 

   Planet1 = []
   Planet2 = []
   Aspect  = []

   for i in range (len (Planets)):

      for j in range (len (Planets)):
         		
         Difference = abs(Planets[i]-Planets[j])
         if Difference >= Ang_Aspect - Orbe and Difference <= Ang_Aspect + Orbe or (Difference >= (Ang_Aspect*Rept - Orbe) and Difference <= (Ang_Aspect*Rept + Orbe)) :
  	    
  	    	
            Planet1.append (Planets[i])
            Planet2.append (Planets[j])
            
   
   Planet1 = np.asarray(Planet1)
   Planet2 = np.asarray(Planet2)
   
   Aspect = [Planet1,Planet2]
   Aspect = np.asarray(Aspect)

   return (Aspect)

def get_planet_info(planet):
    sign = planet.sign
    degreeP = planet.lon
    degreeSign = planet.signlon
    return sign, degreeP, degreeSign

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCION FOR COORDINATE: Coord (R, Angle) 	
# R: Radio ; Angle: Angle of the planet, aspect, House and Sing
#---------------------------------------------------------------------------------------------------------------------------------------

def sen(grados):
    return math.sin(math.radians(grados))
    
def cos(grados):
    return math.cos(math.radians(grados))
    
def Coord (R, Angle):
   
   CoordX          = R * cos (Angle)
   CoordY          = R * sen (Angle)
   
   return (CoordX, CoordY)

def Grad_min (grados_planets):
   
   parte_decimal, parte_entera = math.modf(grados_planets)
   parte_decimal = parte_decimal* 60
   
   return str(int(parte_entera))+u'°', str(round(parte_decimal))+"'" #AGREGAR °!!!!!!!!!!!!!!!

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCION FOR EARTH SING: get_earth_sing (sun_sing) 	
# R: earth_sing (oposite sing of sun)
#---------------------------------------------------------------------------------------------------------------------------------------

def get_earth_sign(sun_sign):
    opposite_signs = {
        'Aries': 'Libra',
        'Taurus': 'Scorpio',
        'Gemini': 'Sagittarius',
        'Cancer': 'Capricorn',
        'Leo': 'Aquarius',
        'Virgo': 'Pisces',
        'Libra': 'Aries',
        'Scorpio': 'Taurus',
        'Sagittarius': 'Gemini',
        'Capricorn': 'Cancer',
        'Aquarius': 'Leo',
        'Pisces': 'Virgo'
    }

    earth_sign = opposite_signs.get(sun_sign, "Unknown")  # Utiliza un valor por defecto en caso de un signo desconocido
    return [earth_sign]

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR DATE AND POSITION: Function for date, time and place for flatlib and Swisseph libraries
# R: returns the processed data of time, date and place for the two libraries.
#---------------------------------------------------------------------------------------------------------------------------------------

def transform_for_libraries(date_str, time_str, timezone_str, lat_str, lon_str):
    # Transformar la fecha y hora en componentes separados
    date = datetime.strptime(date_str, '%Y/%m/%d')
    year = date.year
    month = date.month
    day = date.day

    # Transformar la hora en formato decimal
    time = datetime.strptime(time_str, '%H:%M')
    hour = time.hour + time.minute / 60

    # Extraer la zona horaria en horas decimales
    sign = 1 if timezone_str[0] == '+' else -1
    hours_offset, minutes_offset = map(int, timezone_str[1:].split(':'))
    timezone_offset = sign * (hours_offset + minutes_offset / 60)

    # Calcular la hora UTC
    utc_hour = hour - timezone_offset

    # Transformar las coordenadas geográficas a grados decimales
    lat_deg = int(lat_str[:-4])
    lat_min = float(lat_str[-2:]) / 60
    lon_deg = int(lon_str[:-4])
    lon_min = float(lon_str[-2:]) / 60

    lat_degrees = lat_deg + lat_min
    lon_degrees = lon_deg + lon_min

    if 's' in lat_str:
        lat_degrees *= -1
    if 'w' in lon_str:
        lon_degrees *= -1

    # Crear objetos para flatlib
    flatlib_date = Datetime(date_str, time_str, timezone_str)
    flatlib_pos = GeoPos(lat_str, lon_str)

    

    return {
        "flatlib": {
            "date": flatlib_date,
            "pos": flatlib_pos
        },
    }

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR LUNA NEGRA: Function for black moon calculations
# R: Returns the values ​​in an array of: [degree, minute, sign, sign_index + 1, motion]]
#---------------------------------------------------------------------------------------------------------------------------------------

import os

def load_data_for_year(year):
    # Determinar la década y cargar el archivo correspondiente
    start_year = (year // 10) * 10
    
    # Especificar la ruta completa a la carpeta donde están los archivos
    folder_path = r'E:\JLO\Cosass\Astrología\Fabula_Siderum_SA\Chart_FSCreator\prueba_vectores\Dark_moon_data'
    
    # Formar la ruta completa al archivo
    filename = os.path.join(folder_path, f'dark_moon_data_{start_year}.h5')
    
    # Imprimir la ruta completa
    print(f"Intentando cargar el archivo: {filename}")
    
    # Cargar el archivo HDF5
    df = pd.read_hdf(filename, key='df')
    
    return df



def get_dark_moon_data(df, datetime_str):
    # Buscar la fila que coincide con la fecha y hora especificadas
    result = df[df['DateTime'] == datetime_str]
    
    if result.empty:
        return f"No se encontraron datos para la fecha y hora {datetime_str}"
    else:
        # Extraer los datos necesarios
        degree = int(result['Degree'].values[0])
        minute = int(result['Minute'].values[0])
        sign = result['Sign'].values[0]
        sign_index = int(result['Sign_Number'].values[0])
        motion = result['Motion'].values[0]
        
        # Transformar grados y minutos a grados sexagesimales
        decimal_degrees = degree + (minute / 60)
        
        # Calcular el grado absoluto considerando el signo zodiacal
        absolute_degree = decimal_degrees + (sign_index - 1) * 30
        
        # Formatear los datos en la estructura solicitada
        dark_moon = [degree, minute, sign, sign_index, motion, decimal_degrees, absolute_degree]
        return dark_moon

# Iniciar el contador de tiempo
start_time = time.time()

def get_house_cusp_sign(house):
    ZODIAC_SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 
        'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 
        'Capricorn', 'Aquarius', 'Pisces'
    ]
    longitude = house.lon
    sign_index = int(longitude // 30)
    sign = ZODIAC_SIGNS[sign_index]
    degree = int(longitude % 30)
    return sign

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR LUNA NEGRA: Function for black moon calculations
# R: Returns the values ​​in an array of: [degree, minute, sign, sign_index + 1, motion]]
#---------------------------------------------------------------------------------------------------------------------------------------


def get_house_for_sun(Ang_sun, house_positions):
    """
    Determina en qué casa se encuentra el Sol.

    :param Ang_sun: Longitud ajustada del Sol en grados.
    :param house_positions: Lista de longitudes ajustadas de las cúspides de las casas.
    :return: Número de la casa en la que se encuentra el Sol.
    """
    num_houses = len(house_positions)
    for i in range(num_houses):
        # Obtenemos la cúspide actual y la siguiente
        cusp_start = house_positions[i]
        cusp_end = house_positions[(i + 1) % num_houses]  # La siguiente casa, con modulo para cerrar el ciclo
        
        # Ajustamos para el intervalo que incluye los 360 grados
        if cusp_start > cusp_end:
            if Ang_sun >= cusp_start or Ang_sun < cusp_end:
                return i + 1  # Las casas son de 1 a 12
        else:
            if cusp_start <= Ang_sun < cusp_end:
                return i + 1
    return None

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR ajustar angulos
#---------------------------------------------------------------------------------------------------------------------------------------

def adjust_positions(angles, min_separation=4.5):
    """
    Ajusta las posiciones de los planetas para evitar superposiciones en la carta astral.

    :param angles: Lista de ángulos de los planetas.
    :param min_separation: Separación mínima entre los planetas en grados.
    :return: Lista de ángulos ajustados.
    """
    angles = np.array(angles)
    adjusted_angles = angles.copy()

    # Ordenar los ángulos para facilitar el ajuste
    sorted_indices = np.argsort(adjusted_angles)
    sorted_angles = adjusted_angles[sorted_indices]

    # Ajustar posiciones si están demasiado cerca
    for i in range(1, len(sorted_angles)):
        if sorted_angles[i] - sorted_angles[i - 1] < min_separation:
            sorted_angles[i] = sorted_angles[i - 1] + min_separation

    # Ajustar ángulos fuera del rango 0-360
    sorted_angles = sorted_angles % 360

    # Revertir el orden original
    adjusted_angles[sorted_indices] = sorted_angles

    return adjusted_angles.tolist()

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR angulos valor
#---------------------------------------------------------------------------------------------------------------------------------------

def calculate_angles_and_adjust(chart, dark_moon, Ang_base, min_separation=4.5):
    """
    Calcula los ángulos de los planetas y ajusta las posiciones para evitar superposiciones.

    :param chart: Carta astral.
    :param dark_moon: Datos de la Luna Negra.
    :param Ang_base: Ángulo base calculado.
    :param min_separation: Separación mínima entre los planetas en grados.
    :return: Diccionario con los ángulos ajustados.
    """
    # Calcular los ángulos iniciales
    Ang_sun = chart.getObject(const.SUN).lon + Ang_base
    Ang_moon = chart.get(const.MOON).lon + Ang_base
    Ang_mercury = chart.get(const.MERCURY).lon + Ang_base
    Ang_venus = chart.get(const.VENUS).lon + Ang_base
    Ang_mars = chart.get(const.MARS).lon + Ang_base
    Ang_jupiter = chart.get(const.JUPITER).lon + Ang_base
    Ang_saturn = chart.get(const.SATURN).lon + Ang_base
    Ang_uranus = chart.get(const.URANUS).lon + Ang_base
    Ang_neptune = chart.get(const.NEPTUNE).lon + Ang_base
    Ang_pluto = chart.get(const.PLUTO).lon + Ang_base
    Ang_chiron = chart.get(const.CHIRON).lon + Ang_base
    Ang_north_node = chart.get(const.NORTH_NODE).lon + Ang_base
    Ang_south_node = chart.get(const.SOUTH_NODE).lon + Ang_base
    Ang_part_fortuna = chart.get(const.PARS_FORTUNA).lon + Ang_base
    Ang_earth = Ang_sun + 180 -360
    Ang_Asc = chart.get(const.HOUSE1).lon + Ang_base
    Ang_Mc = chart.get(const.HOUSE10).lon + Ang_base
    Ang_dark_moon = dark_moon[0] + dark_moon[1] / 60 + 30 * (dark_moon[3] - 1) + Ang_base

    # Crear la lista de ángulos para ajustar
    angles = [
        Ang_sun, Ang_moon, Ang_mercury, Ang_venus, Ang_mars, 
        Ang_jupiter, Ang_saturn, Ang_uranus, Ang_neptune, Ang_pluto,
        Ang_chiron, Ang_north_node, Ang_south_node, Ang_part_fortuna, Ang_earth,
        Ang_Asc, Ang_Mc, Ang_dark_moon
    ]
    
    
    # Ajustar las posiciones
    adjusted_angles = adjust_positions(angles, min_separation)
    

    # Asignar los ángulos ajustados a las variables correspondientes
    Ang_sun, Ang_moon, Ang_mercury, Ang_venus, Ang_mars, Ang_jupiter, Ang_saturn, Ang_uranus, \
    Ang_neptune, Ang_pluto, Ang_chiron, Ang_north_node, Ang_south_node, Ang_part_fortuna, \
    Ang_earth, Ang_Asc, Ang_Mc, Ang_dark_moon = adjusted_angles

    return (Ang_sun, Ang_moon, Ang_mercury, Ang_venus, Ang_mars, Ang_jupiter, Ang_saturn, 
            Ang_uranus, Ang_neptune, Ang_pluto, Ang_chiron, Ang_north_node, Ang_south_node, 
            Ang_part_fortuna, Ang_earth, Ang_Asc, Ang_Mc, Ang_dark_moon)

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR angulos valor Comined chart
#---------------------------------------------------------------------------------------------------------------------------------------

def calculate_angles_and_adjust_Com(chart, dark_moon, Ang_base, min_separation=4.5):
    """
    Calcula los ángulos de los planetas y ajusta las posiciones para evitar superposiciones.

    :param chart: Carta astral.
    :param dark_moon: Datos de la Luna Negra.
    :param Ang_base: Ángulo base calculado.
    :param min_separation: Separación mínima entre los planetas en grados.
    :return: Diccionario con los ángulos ajustados.
    """
    # Calcular los ángulos iniciales
    Ang_sun = chart[const.SUN][0] + Ang_base
    Ang_moon = chart[const.MOON][0] + Ang_base
    Ang_mercury = chart[const.MERCURY][0] + Ang_base
    Ang_venus = chart[const.VENUS][0] + Ang_base
    Ang_mars = chart[const.MARS][0] + Ang_base
    Ang_jupiter = chart[const.JUPITER][0] + Ang_base
    Ang_saturn = chart[const.SATURN][0] + Ang_base
    Ang_uranus = chart[const.URANUS][0] + Ang_base
    Ang_neptune = chart[const.NEPTUNE][0] + Ang_base
    Ang_pluto = chart[const.PLUTO][0] + Ang_base
    Ang_chiron = chart[const.CHIRON][0] + Ang_base
    Ang_north_node = chart[const.NORTH_NODE][0] + Ang_base
    Ang_south_node = chart[const.SOUTH_NODE][0] + Ang_base
    Ang_part_fortuna = chart[const.PARS_FORTUNA][0] + Ang_base
    Ang_earth = Ang_sun + 180 -360
    Ang_Asc = chart[const.HOUSE1] + Ang_base
    Ang_Mc = chart[const.HOUSE10] + Ang_base
    Ang_dark_moon = dark_moon[0] + dark_moon[1] / 60 + 30 * (dark_moon[3] - 1) + Ang_base

    # Crear la lista de ángulos para ajustar
    angles = [
        Ang_sun, Ang_moon, Ang_mercury, Ang_venus, Ang_mars, 
        Ang_jupiter, Ang_saturn, Ang_uranus, Ang_neptune, Ang_pluto,
        Ang_chiron, Ang_north_node, Ang_south_node, Ang_part_fortuna, Ang_earth,
        Ang_Asc, Ang_Mc, Ang_dark_moon
    ]
    
    
    # Ajustar las posiciones
    adjusted_angles = adjust_positions(angles, min_separation)
    

    # Asignar los ángulos ajustados a las variables correspondientes
    Ang_sun, Ang_moon, Ang_mercury, Ang_venus, Ang_mars, Ang_jupiter, Ang_saturn, Ang_uranus, \
    Ang_neptune, Ang_pluto, Ang_chiron, Ang_north_node, Ang_south_node, Ang_part_fortuna, \
    Ang_earth, Ang_Asc, Ang_Mc, Ang_dark_moon = adjusted_angles

    return (Ang_sun, Ang_moon, Ang_mercury, Ang_venus, Ang_mars, Ang_jupiter, Ang_saturn, 
            Ang_uranus, Ang_neptune, Ang_pluto, Ang_chiron, Ang_north_node, Ang_south_node, 
            Ang_part_fortuna, Ang_earth, Ang_Asc, Ang_Mc, Ang_dark_moon)

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR ajustar numero de las casas CORREGIR-->ERROR
#---------------------------------------------------------------------------------------------------------------------------------------


def ajustar_coordenadas_casas(casas):
    """
    Ajusta las coordenadas de las casas opuestas para que no sean iguales y estén correctamente ajustadas,
    asegurando que las casas estén ordenadas de menor a mayor.

    :param casas: Diccionario con las coordenadas de las casas.
    :return: Diccionario con las coordenadas ajustadas.
    """
    # Asegurarse de que las casas están ordenadas de menor a mayor
    casas_ordenadas = {str(i): casas.get(str(i), [0, 0, 0, 0, 0, 0]) for i in range(1, 13)}

    # Recorrer las casas y ajustar las opuestas
    for i in range(1, 7):
        casa_actual = str(i)
        casa_opuesta = str(i + 6)

        # Ajustar las coordenadas X3 y Y3 de las casas opuestas
        casas_ordenadas[casa_opuesta][4] = -casas_ordenadas[casa_actual][4]
        casas_ordenadas[casa_opuesta][5] = -casas_ordenadas[casa_actual][5]

    return casas_ordenadas

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR Función para transformar datos
#---------------------------------------------------------------------------------------------------------------------------------------

def transform_for_libraries(date_str, time_str, timezone_str, lat_str, lon_str):
    # Transformar datos para flatlib
    flatlib_date = Datetime(date_str, time_str, timezone_str)
    flatlib_pos = GeoPos(lat_str, lon_str)
              
    return {
        "flatlib": {"date": flatlib_date, "pos": flatlib_pos},
        
    }




#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR Función para crear una carta combinada
#---------------------------------------------------------------------------------------------------------------------------------------

def midpoint(lon1, lon2):
    diff = abs(lon1 - lon2)
    if diff > 180:
        if lon1 > lon2:
            lon1 -= 360
        else:
            lon2 -= 360
    return (lon1 + lon2) / 2 % 360

def create_combined_chart(flatlib_date1, flatlib_pos1, flatlib_date2, flatlib_pos2):
    chart1 = Chart(flatlib_date1, flatlib_pos1, hsys=const.HOUSES_PLACIDUS, IDs=const.LIST_OBJECTS)
    chart2 = Chart(flatlib_date2, flatlib_pos2, hsys=const.HOUSES_PLACIDUS, IDs=const.LIST_OBJECTS)

    combined_chart = {}
    
    planets = [
        const.SUN, const.MOON, const.MERCURY, const.VENUS, const.MARS, const.JUPITER,
        const.SATURN, const.URANUS, const.NEPTUNE, const.PLUTO, const.CHIRON,
        const.NORTH_NODE, const.SOUTH_NODE, const.PARS_FORTUNA
    ]

    for planet in planets:
        try:
            lon1 = chart1.getObject(planet).lon
            lon2 = chart2.getObject(planet).lon
            combined_angle = midpoint(lon1, lon2)

            sign_index = int(combined_angle // 30)
            signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            degree = combined_angle % 30
            sign = signs[sign_index]

            movement = "Direct"

            combined_chart[planet] = [combined_angle, degree, sign, movement]
        except KeyError:
            print(f"El objeto {planet} no se encontró en una de las cartas.")

    houses = [
        const.HOUSE1, const.HOUSE2, const.HOUSE3, const.HOUSE4, const.HOUSE5, const.HOUSE6,
        const.HOUSE7, const.HOUSE8, const.HOUSE9, const.HOUSE10, const.HOUSE11, const.HOUSE12
    ]

    for house in houses:
        try:
            lon1 = chart1.getHouse(house).lon
            lon2 = chart2.getHouse(house).lon
            combined_angle = midpoint(lon1, lon2)
            combined_chart[house] = combined_angle
        except KeyError:
            print(f"La casa {house} no se encontró en una de las cartas.")
    
    return combined_chart

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION FOR luna negra combinada
#---------------------------------------------------------------------------------------------------------------------------------------


def combine_dark_moon(dark_moon1, dark_moon2):
    """
    Combina las posiciones de la Luna Negra de dos cartas natales.
    """
    lon1 = dark_moon1[0] + dark_moon1[1] / 60 + (dark_moon1[3] - 1) * 30
    lon2 = dark_moon2[0] + dark_moon2[1] / 60 + (dark_moon2[3] - 1) * 30

    combined_lon = midpoint(lon1, lon2)
    degree = int(combined_lon)
    minute = int((combined_lon - degree) * 60)
    signs = ["Aries", "Tauro", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Escorpio", "Sagittarius", "Capricorn", "Aquarius", "Piscis"]
    sign_index = degree // 30
    sign = signs[sign_index]
    degree %= 30

    # Assume the motion is Direct if both are Direct, Retrograde if both are Retrograde
    if dark_moon1[4] == dark_moon2[4]:
        motion = dark_moon1[4]
    else:
        motion = "Direct"  # Default to Direct if there is a difference

    return [degree, minute, sign, sign_index + 1, motion]

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION for dignities of the planet
#---------------------------------------------------------------------------------------------------------------------------------------

# Diccionarios con dignidades de los planetas
dignidades = {
    'Sol': {
        'regente': 'Leo', 'exilio': 'Aquarius', 'exaltacion': 'Aries', 'caida': 'Libra'
    },
    'Luna': {
        'regente': 'Cancer', 'exilio': 'Capricorn', 'exaltacion': 'Taurus', 'caida': 'Scorpio'
    },
    'Mercurio': {
        'regente': 'Gemini', 'exilio': 'Sagittarius', 'exaltacion': 'Aquarius', 'caida': 'Leo'
    },
    'Venus': {
        'regente': ['Taurus', 'Libra'], 'exilio': ['Scorpio', 'Aries'], 'exaltacion': 'Pisces', 'caida': 'Virgo'
    },
    'Marte': {
        'regente': 'Aries', 'exilio': 'Libra', 'exaltacion': 'Capricorn', 'caida': 'Cancer'
    },
    'Júpiter': {
        'regente': 'Sagittarius', 'exilio': 'Gemini', 'exaltacion': 'Cancer', 'caida': 'Capricorn'
    },
    'Saturno': {
        'regente': 'Capricorn', 'exilio': 'Leo', 'exaltacion': 'Libra', 'caida': 'Aries'
    },
    'Urano': {
        'regente': 'Aquarius', 'exilio': 'Leo', 'exaltacion': 'Scorpio', 'caida': 'Taurus'
    },
    'Neptuno': {
        'regente': 'Pisces', 'exilio': 'Virgo', 'exaltacion': 'Cancer', 'caida': 'Capricorn'
    },
    'Plutón': {
        'regente': 'Scorpio', 'exilio': 'Taurus', 'exaltacion': 'Aries', 'caida': 'Libra'
    },
    'Quirón': {
        'regente': 'Virgo', 'exilio': 'Pisces', 'exaltacion': 'Taurus', 'caida': 'Scorpio'
    },
    'Luna Negra': {
        'regente': 'Escorpio', 'exilio': 'Tauro', 'exaltacion': 'Aries', 'caida': 'Libra'
    }
}

# Función para asignar la dignidad al planeta según su signo
def asignar_dignidad(planeta, signo):
    if planeta in dignidades:
        dignidad_info = dignidades[planeta]
        if isinstance(dignidad_info['regente'], list) and signo in dignidad_info['regente']:
            return 'regente'
        elif signo == dignidad_info['regente']:
            return 'regente'
        elif isinstance(dignidad_info['exilio'], list) and signo in dignidad_info['exilio']:
            return 'exilio'
        elif signo == dignidad_info['exilio']:
            return 'exilio'
        elif signo == dignidad_info['exaltacion']:
            return 'exaltacion'
        elif signo == dignidad_info['caida']:
            return 'caida'
    return 'Sin dignidad'

def get_planet_dignity(planets):
    for planet_name, planet_info in planets.items():
        signo = planet_info[0]
        dignidad = asignar_dignidad(planet_name, signo)
        print(f"{planet_name} en {signo} tiene dignidad: {dignidad}")

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION for element of the planet
#---------------------------------------------------------------------------------------------------------------------------------------


# Función para asignar el elemento según el signo
def asignar_elemento(signo):
    elementos = {
        'Fuego': ['Aries', 'Leo', 'Sagittarius'],
        'Tierra': ['Taurus', 'Virgo', 'Capricorn'],
        'Aire': ['Gemini', 'Libra', 'Aquarius'],
        'Agua': ['Cancer', 'Scorpio', 'Pisces']
    }
    for elemento, signos in elementos.items():
        if signo in signos:
            return elemento
    return 'Desconocido'


#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION for Ranking afinidad signo
#---------------------------------------------------------------------------------------------------------------------------------------

# Función para asignar la cruz según el signo
def asignar_cruz(signo):
    cruces = {
        'Cardinal': ['Aries', 'Libra', 'Cancer', 'Capricorn'],
        'Fijo': ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
        'Mutable': ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
    }
    for cruz, signos in cruces.items():
        if signo in signos:
            return cruz
    return 'Desconocido'

# Asignar elemento y cruz a los planetas
def get_planet_nature(planets):
    for planet_name, planet_info in planets.items():
        signo = planet_info[0]
        elemento = asignar_elemento(signo)
        cruz = asignar_cruz(signo)
        print(f"{planet_name} en {signo} es del elemento: {elemento} y de la cruz: {cruz}")

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION for Signo interceptado
#---------------------------------------------------------------------------------------------------------------------------------------


def signo_interceptado_en_casa(signo, casa_inicio, casa_fin):
    # Grados de inicio y fin de los signos en el zodiaco
    signos_grados = {
        'Aries': (0, 30), 'Taurus': (30, 60), 'Gemini': (60, 90), 'Cancer': (90, 120),
        'Leo': (120, 150), 'Virgo': (150, 180), 'Libra': (180, 210), 'Scorpio': (210, 240),
        'Sagittarius': (240, 270), 'Capricorn': (270, 300), 'Aquarius': (300, 330), 'Pisces': (330, 360)
    }
    
    # Obtener los grados de inicio y fin del signo
    inicio_signo, fin_signo = signos_grados[signo]
    
    # Ajuste en caso de que la casa cruce 0° Aries
    if casa_inicio > casa_fin:
        # Si el signo está entre casa_inicio y 360 o entre 0 y casa_fin, es interceptado
        return (casa_inicio <= inicio_signo < 360 or 0 <= fin_signo < casa_fin)
    else:
        # Verificar si el signo está entre los grados de la casa
        return casa_inicio <= inicio_signo and fin_signo <= casa_fin
    

#---------------------------------------------------------------------------------------------------------------------------------------
# FUNCTION for Eclipses entre 2010-2040
#---------------------------------------------------------------------------------------------------------------------------------------


eclipse_data = [
    # Solar Eclipses
    {"date": "2010-01-15", "type": "Solar", "subtype": "Annular"},
    {"date": "2010-07-11", "type": "Solar", "subtype": "Total"},
    {"date": "2011-01-04", "type": "Solar", "subtype": "Partial"},
    {"date": "2011-06-01", "type": "Solar", "subtype": "Partial"},
    {"date": "2011-07-01", "type": "Solar", "subtype": "Partial"},
    {"date": "2011-11-25", "type": "Solar", "subtype": "Partial"},
    {"date": "2012-05-20", "type": "Solar", "subtype": "Annular"},
    {"date": "2012-11-13", "type": "Solar", "subtype": "Total"},
    {"date": "2013-05-10", "type": "Solar", "subtype": "Annular"},
    {"date": "2013-11-03", "type": "Solar", "subtype": "Hybrid"},
    {"date": "2014-04-29", "type": "Solar", "subtype": "Annular"},
    {"date": "2015-03-20", "type": "Solar", "subtype": "Total"},
    {"date": "2016-03-09", "type": "Solar", "subtype": "Total"},
    {"date": "2016-09-01", "type": "Solar", "subtype": "Annular"},
    {"date": "2017-02-26", "type": "Solar", "subtype": "Annular"},
    {"date": "2017-08-21", "type": "Solar", "subtype": "Total"},
    {"date": "2018-02-15", "type": "Solar", "subtype": "Partial"},
    {"date": "2019-07-02", "type": "Solar", "subtype": "Total"},
    {"date": "2020-06-21", "type": "Solar", "subtype": "Annular"},
    {"date": "2021-12-04", "type": "Solar", "subtype": "Total"},
    {"date": "2023-04-20", "type": "Solar", "subtype": "Hybrid"},
    {"date": "2024-04-08", "type": "Solar", "subtype": "Total"},
    {"date": "2024-10-02", "type": "Solar", "subtype": "Annular"},
    {"date": "2025-03-29", "type": "Solar", "subtype": "Partial"},
    {"date": "2025-09-21", "type": "Solar", "subtype": "Partial"},
    {"date": "2026-08-12", "type": "Solar", "subtype": "Annular"},
    {"date": "2027-08-02", "type": "Solar", "subtype": "Total"},
    {"date": "2028-01-26", "type": "Solar", "subtype": "Annular"},
    {"date": "2029-06-12", "type": "Solar", "subtype": "Partial"},
    {"date": "2030-06-01", "type": "Solar", "subtype": "Annular"},
    {"date": "2031-05-09", "type": "Solar", "subtype": "Partial"},
    {"date": "2032-10-25", "type": "Solar", "subtype": "Total"},
    {"date": "2033-03-30", "type": "Solar", "subtype": "Hybrid"},
    {"date": "2035-09-02", "type": "Solar", "subtype": "Total"},
    {"date": "2036-03-09", "type": "Solar", "subtype": "Annular"},
    {"date": "2037-07-13", "type": "Solar", "subtype": "Partial"},
    {"date": "2038-01-05", "type": "Solar", "subtype": "Annular"},
    {"date": "2039-07-02", "type": "Solar", "subtype": "Total"},
    {"date": "2040-07-12", "type": "Solar", "subtype": "Total"},
    {"date": "2040-12-26", "type": "Solar", "subtype": "Annular"},
    # Lunar Eclipses
    {"date": "2010-06-26", "type": "Lunar", "subtype": "Partial"},
    {"date": "2010-12-21", "type": "Lunar", "subtype": "Total"},
    {"date": "2011-06-15", "type": "Lunar", "subtype": "Total"},
    {"date": "2011-12-10", "type": "Lunar", "subtype": "Total"},
    {"date": "2012-06-04", "type": "Lunar", "subtype": "Partial"},
    {"date": "2012-11-28", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2013-04-25", "type": "Lunar", "subtype": "Partial"},
    {"date": "2013-10-18", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2014-04-15", "type": "Lunar", "subtype": "Total"},
    {"date": "2014-10-08", "type": "Lunar", "subtype": "Total"},
    {"date": "2015-04-04", "type": "Lunar", "subtype": "Total"},
    {"date": "2015-09-28", "type": "Lunar", "subtype": "Total"},
    {"date": "2016-03-23", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2016-09-16", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2017-08-07", "type": "Lunar", "subtype": "Partial"},
    {"date": "2018-01-31", "type": "Lunar", "subtype": "Total"},
    {"date": "2018-07-27", "type": "Lunar", "subtype": "Total"},
    {"date": "2019-01-21", "type": "Lunar", "subtype": "Total"},
    {"date": "2019-07-16", "type": "Lunar", "subtype": "Partial"},
    {"date": "2020-01-10", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2020-06-05", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2020-11-30", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2021-05-26", "type": "Lunar", "subtype": "Total"},
    {"date": "2021-11-19", "type": "Lunar", "subtype": "Partial"},
    {"date": "2022-05-16", "type": "Lunar", "subtype": "Total"},
    {"date": "2022-11-08", "type": "Lunar", "subtype": "Total"},
    {"date": "2023-05-05", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2023-10-28", "type": "Lunar", "subtype": "Partial"},
    {"date": "2024-03-25", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2024-09-18", "type": "Lunar", "subtype": "Partial"},
    {"date": "2025-03-14", "type": "Lunar", "subtype": "Total"},
    {"date": "2025-09-07", "type": "Lunar", "subtype": "Partial"},
    {"date": "2026-03-03", "type": "Lunar", "subtype": "Total"},
    {"date": "2026-08-28", "type": "Lunar", "subtype": "Total"},
    {"date": "2027-02-20", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2027-08-18", "type": "Lunar", "subtype": "Partial"},
    {"date": "2028-02-11", "type": "Lunar", "subtype": "Total"},
    {"date": "2028-08-06", "type": "Lunar", "subtype": "Partial"},
    {"date": "2029-01-31", "type": "Lunar", "subtype": "Total"},
    {"date": "2029-07-27", "type": "Lunar", "subtype": "Partial"},
    {"date": "2030-01-21", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2030-07-18", "type": "Lunar", "subtype": "Total"},
    {"date": "2031-01-10", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2031-07-06", "type": "Lunar", "subtype": "Total"},
    {"date": "2032-06-25", "type": "Lunar", "subtype": "Partial"},
    {"date": "2032-12-20", "type": "Lunar", "subtype": "Total"},
    {"date": "2033-06-15", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2033-12-10", "type": "Lunar", "subtype": "Partial"},
    {"date": "2034-06-05", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2034-11-30", "type": "Lunar", "subtype": "Total"},
    {"date": "2035-05-26", "type": "Lunar", "subtype": "Total"},
    {"date": "2035-11-19", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2036-05-15", "type": "Lunar", "subtype": "Partial"},
    {"date": "2036-11-07", "type": "Lunar", "subtype": "Total"},
    {"date": "2037-05-01", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2037-10-26", "type": "Lunar", "subtype": "Partial"},
    {"date": "2038-04-20", "type": "Lunar", "subtype": "Total"},
    {"date": "2038-10-15", "type": "Lunar", "subtype": "Total"},
    {"date": "2039-04-08", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2039-10-02", "type": "Lunar", "subtype": "Partial"},
    {"date": "2040-01-10", "type": "Lunar", "subtype": "Penumbral"},
    {"date": "2040-06-05", "type": "Lunar", "subtype": "Partial"},
]

def get_eclipses(year=None, month=None, eclipse_type=None):
    results = []
    for eclipse in eclipse_data:
        eclipse_year, eclipse_month, _ = eclipse["date"].split("-")
        if (year is None or int(eclipse_year) == year) and \
           (month is None or int(eclipse_month) == month) and \
           (eclipse_type is None or eclipse["type"].lower() == eclipse_type.lower()):
            results.append(eclipse)
    return results


