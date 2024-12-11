import serial
import json

# Función para transformar los datos en formato JSON
def parse_to_json(data):
    keys_mapping = {
        "T": "TEMP",
        "P": "PRESION",
        "H": "HUMEDAD",
        "L": "LUX"
    }

    items = data.strip().split(';')
    result = {}
    for item in items:
        if ':' in item:
            key, value = item.split(':')
            mapped_key = keys_mapping.get(key, key)
            result[mapped_key] = float(value) if value.replace('.', '', 1).isdigit() else value
    return json.dumps(result, indent=4)

# Función principal para leer datos del puerto serial
def readData(port='/dev/ttyACM0', baudrate=9600, timeout=1):
    """
    Lee datos desde un puerto serial y devuelve el resultado como JSON.

    :param port: Nombre del puerto serial (por defecto '/dev/ttyACM0').
    :param baudrate: Velocidad en baudios (por defecto 9600).
    :param timeout: Tiempo de espera en segundos (por defecto 1).
    :return: JSON con los datos leídos.
    """
    try:
        # Configurar el puerto serial
        ser = serial.Serial(port, baudrate, timeout=timeout)
        print(f"Conexión establecida en el puerto {port}. Leyendo datos...")

        while True:
            line = ser.readline().decode('utf-8').strip()
            if line:
                return parse_to_json(line)

    except serial.SerialException as e:
        print(f"Error al configurar el puerto serial: {e}")
        return None
    except KeyboardInterrupt:
        print("\nConexión cerrada por el usuario.")
        return None
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("Conexión serial cerrada.")
