import serial
import json

# Configuraci�n del puerto serial
ser = serial.Serial('/dev/ttyACM0', 9600, timeout=1)

keys_mapping = {
    "T": "TEMP",
    "P": "PRESION",
    "H": "HUMEDAD",
    "L": "LUX"
}

def parse_to_json(data):
    items = data.strip().split(';')
    result = {}
    for item in items:
        if ':' in item:
            key, value = item.split(':')
            mapped_key = keys_mapping.get(key, key)
            result[mapped_key] = float(value) if value.replace('.', '', 1).isdigit() else value
    return json.dumps(result, indent=4)

try:
    while True:
        line = ser.readline().decode('utf-8').strip()
        if line:
            json_data = parse_to_json(line)
            print(json_data)

except KeyboardInterrupt:
    print("Conexi�n cerrada.")
finally:
    ser.close()