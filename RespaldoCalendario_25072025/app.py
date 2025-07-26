# app.py

from flask import Flask, jsonify, request
from Calendario_Astral import generate_calendar_data
import datetime

# Inicializa la aplicación Flask
# Le decimos que los archivos estáticos (html, css, js) están en la carpeta 'static'
app = Flask(__name__, static_folder='static', static_url_path='')

# Creamos una ruta para obtener los datos del calendario
@app.route('/get_calendar_data')
def get_calendar_data():
    # Obtenemos el año y mes de la petición. Si no vienen, usamos el actual.
    today = datetime.date.today()
    year_str = request.args.get('year', default=str(today.year), type=str)
    month_str = request.args.get('month', default=str(today.month), type=str)

    try:
        year = int(year_str)
        month = int(month_str)
        
        # Llamamos a nuestra función de cálculo importada
        calendar_data = generate_calendar_data(year, month)
        
        # Devolvemos los datos en formato JSON
        return jsonify(calendar_data)

    except (ValueError, TypeError):
        return jsonify({"error": "Año y mes deben ser números válidos."}), 400

# Ruta principal que sirve nuestro index.html
@app.route('/')
def index():
    return app.send_static_file('index.html')

# Esto es para ejecutar el servidor cuando corremos "python app.py"
if __name__ == '__main__':
    app.run(debug=True)