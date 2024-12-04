import threading
import time
import requests
from flask import Flask, jsonify, render_template
import random

app = Flask(__name__)

# Datos simulados iniciales
data = {
    'timestamps': [],
    'temperature': [],
    'humidity': [],
    'light_intensity': [],
    'uv_radiation': [],
    'dust_concentration': [],
    'rain_chance': 0
}


# Actualiza los datos dinámicamente desde Open-Meteo API
def update_data():
    while True:
        try:
            # Solicita datos de la API de Open-Meteo
            response = requests.get("https://api.open-meteo.com/v1/forecast", params={
                "latitude": 43.263012,  # Cambia a tu ubicación
                "longitude": -2.934985,
                "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,uv_index",
                "current_weather": True,
                "timezone": "auto"
            })
            weather_data = response.json()
            hourly = weather_data.get("hourly", {})
            current = weather_data.get("current_weather", {})

            # Actualiza los datos con información recibida de la API
            data['timestamps'] = current.get('time', [])[:3]
            data['temperature'] = current.get('temperature_2m', [])[:3]
            data['humidity'] = current.get('relative_humidity_2m', [])[:3]
            data['light_intensity'] = [random.randint(100, 200) for _ in range(3)]
            data['dust_concentration'] = [random.randint(10, 30) for _ in range(3)]
            data['uv_radiation'] = current.get('uv_index', [])[:3]
            data['rain_chance'] = current.get('precipitation_probability', 0)

        except Exception as e:
            print(f"Error actualizando datos: {e}")

        # Espera 5 minutos antes de la siguiente actualización
        time.sleep(300)


# Rutas
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/data')
def get_data():
    return jsonify(data)


# Hilo para actualizar datos
thread = threading.Thread(target=update_data, daemon=True)
thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
