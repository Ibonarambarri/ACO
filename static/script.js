// Contextos de gráficos
const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
const humidityCtx = document.getElementById('humidityChart').getContext('2d');
const pressureCtx = document.getElementById('pressureChart').getContext('2d');

// Gráfico de Temperatura
const temperatureChart = new Chart(temperatureCtx, {
    type: 'line',
    data: {
        labels: [],
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
            legend: { display: false }
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

// Gráfico de Presión Atmosférica
const pressureChart = new Chart(pressureCtx, {
    type: 'line',
    data: {
        labels: [],
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
            legend: { display: false }
        }
    }
});

// Fetch de datos reales desde Flask
async function fetchData() {
    try {
        const response = await fetch('/data'); // Endpoint Flask para datos
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateCharts(data);
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// Función para actualizar gráficos y datos
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

    // Actualizar gráfico de Presión Atmosférica
    pressureChart.data.labels = data.timestamps;
    pressureChart.data.datasets[0].data = data.pressure;
    document.getElementById('pressure-title').innerText = `Presión: ${data.pressure[data.pressure.length - 1].toFixed(1)} hPa`;
    pressureChart.update();

    // Actualizar datos de Lux
    if (data.light_intensity && data.light_intensity.length) {
        document.getElementById('light-data').innerText = `Lux: ${data.light_intensity[data.light_intensity.length - 1].toFixed(1)} lux`;
    }
}

// Llamada inicial y repetición cada 2 segundos
fetchData();
setInterval(fetchData, 2000);
