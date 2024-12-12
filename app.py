import threading
from flask import Flask, jsonify, render_template
from datos import readData
import json
import time

app = Flask(__name__)

# Datos simulados iniciales
# En app.py
data = {
    'Temp': [],
    'Presion': [],
    'Humedad': [],
    'Lux': []
}

# Actualiza los datos dinámicamente desde la función readData
def update_data():
    global data  # Necesario para modificar el diccionario global
    while True:
        try:
            # Llama a readData y actualiza los datos
            raw_data = readData('/dev/ttyACM0', 9600, 1)
            if raw_data:  # Verifica que readData devuelva algo válido
                json_data = json.loads(raw_data)  # Convierte el JSON a un diccionario

                # Actualiza los datos dinámicamente, manteniendo un historial limitado
                data['Temp'].append(json_data.get('TEMP', 0))
                data['Presion'].append(json_data.get('PRESION', 0))
                data['Humedad'].append(json_data.get('HUMEDAD', 0))
                data['Lux'].append(json_data.get('LUX', 0))

                # Limita el historial a las últimas 100 entradas
                for key in data.keys():
                    data[key] = data[key][-100:]
        except Exception as e:
            print(f"Error en update_data: {e}")
        time.sleep(60)

# Rutas
@app.route('/')
def index():
    return render_template('index.html')  # Asegúrate de tener este archivo en `templates/`

@app.route('/data')
def get_data():
    return jsonify(data)

# Hilo para actualizar datos
thread = threading.Thread(target=update_data, daemon=True)
thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
