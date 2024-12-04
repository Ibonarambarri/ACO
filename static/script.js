// Selección de elementos para el medidor UV
const uvNeedle = document.querySelector('.uv-needle'); // Aguja del medidor UV
const uvValueCircle = document.getElementById('uv-value-circle'); // Valor en el centro del medidor UV

// Función para actualizar el medidor UV
function updateUvMeter(uvIndex) {
    // Rango de rotación de 0° (bajo) a 360° (extremo)
    const rotation = (uvIndex / 11) * 360; // Ajustar la rotación según el índice UV (11 es el valor máximo de UV)
    uvNeedle.style.transform = `rotate(${rotation}deg)`; // Actualiza la rotación de la aguja
    uvValueCircle.textContent = uvIndex.toFixed(1); // Mostrar el índice UV con 1 decimal
}

// Contextos de gráficos
const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
const humidityCtx = document.getElementById('humidityChart').getContext('2d');
const rainCtx = document.getElementById('rainChart').getContext('2d');
const pressureCtx = document.getElementById('pressureChart').getContext('2d');

// Gráfico de Temperatura
const temperatureChart = new Chart(temperatureCtx, {
    type: 'line',
    data: {
        datasets: [{
            data: [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false // Desactiva la leyenda
            }
        }
    }
});

// Gráfico de Humedad
const humidityChart = new Chart(humidityCtx, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [0, 100],
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(200, 200, 200, 0.2)']
        }]
    },
    options: { responsive: true }
});

// Gráfico de Probabilidad de Lluvia
const rainChart = new Chart(rainCtx, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [0, 100],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(200, 200, 200, 0.2)']
        }]
    },
    options: { responsive: true }
});

// Gráfico de Presión Atmosférica
const pressureChart = new Chart(pressureCtx, {
    type: 'line',
    data: {
        datasets: [{
            data: [],
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false // Desactiva la leyenda
            }
        }
    }
});

// Fetch de datos reales desde Flask
async function fetchData() {
    try {
        const response = await fetch('/data'); // Flask sirve datos en /data
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateCharts(data);
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// Función para actualizar los gráficos y datos
function updateCharts(data) {
    console.log('Datos recibidos:', data);

    // Actualizar gráfico de Temperatura
    temperatureChart.data.labels = data.timestamps;
    temperatureChart.data.datasets[0].data = data.temperature;
    document.getElementById('temperature-title').innerText = `Temperatura: ${data.temperature[data.temperature.length - 1].toFixed(1)}°C`;
    temperatureChart.update();

    // Actualizar gráfico de Humedad
    humidityChart.data.datasets[0].data = [data.humidity[data.humidity.length - 1], 100 - data.humidity[data.humidity.length - 1]];
    document.getElementById('humidity-title').innerText = `Humedad: ${data.humidity[data.humidity.length - 1].toFixed(1)}%`;
    humidityChart.update();

    // Actualizar gráfico de Probabilidad de Lluvia
    rainChart.data.datasets[0].data = [data.rain_chance, 100 - data.rain_chance];
    document.getElementById('rain-title').innerText = `Lluvia: ${data.rain_chance}%`;
    rainChart.update();

    // Actualizar gráfico de Presión Atmosférica
    pressureChart.data.labels = data.timestamps;
    pressureChart.data.datasets[0].data = data.pressure;
    document.getElementById('pressure-title').innerText = `Presión: ${data.pressure[data.pressure.length - 1].toFixed(1)} hPa`;
    pressureChart.update();

    // Actualizar datos simples
    document.getElementById('light-data').innerText = `${data.light_intensity[data.light_intensity.length - 1].toFixed(1)} lux`;
    document.getElementById('dust-data').innerText = `${data.dust_concentration[data.dust_concentration.length - 1].toFixed(1)} µg/m³`;

    // Actualizar medidor UV
    const uvIndex = data.uv_radiation[data.uv_radiation.length - 1];
    updateUvMeter(uvIndex);
}

// Llamada inicial y repetición cada 2 segundos
fetchData();
setInterval(() => {
    fetchData();
}, 1000);
