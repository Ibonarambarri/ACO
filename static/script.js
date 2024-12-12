// Contextos de gráficos
const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
const humidityCtx = document.getElementById('humidityChart').getContext('2d');
const pressureCtx = document.getElementById('pressureChart').getContext('2d');
const lightCtx = document.getElementById('lightChart').getContext('2d');

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
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// Gráfico de Humedad
const humidityChart = new Chart(humidityCtx, {
    type: 'doughnut',
    data: {
        labels: [],
        datasets: [{
            data: [0, 100],
            backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(200, 200, 200, 0.2)']
        }]
    },
    options: {
        responsive: true,
        cutout: '70%'
    }
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
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// Gráfico de Intensidad Lumínica
const lightChart = new Chart(lightCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// Función para calcular probabilidad de lluvia
function calculateRainProbability(humidities, pressures, temps) {
    const weights = { w1: 0.5, w2: 0.3, w3: 0.2 };
    let totalProbability = 0;

    // Verificar que todos los arrays tengan la misma longitud
    if (humidities.length !== pressures.length || pressures.length !== temps.length) {
        console.error('Error: Los arrays de datos deben tener la misma longitud.');
        return 0;
    }

    // Calcular la probabilidad para cada conjunto de datos
    for (let i = 0; i < humidities.length; i++) {
        let humedad = humidities[i];
        let presion = pressures[i];
        let temperatura = temps[i];

        let probabilidad = weights.w1 * humedad +
                           weights.w2 * (1013 - presion) +
                           weights.w3 * (30 - temperatura);

        // Normalizar la probabilidad
        probabilidad = Math.min(Math.max(0, probabilidad), 100);

        totalProbability += probabilidad;
    }

    // Promedio de la probabilidad
    return (totalProbability / humidities.length).toFixed(2);
}


// Fetch de datos reales desde Flask
async function fetchData() {
    try {
        const response = await fetch('/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Verificar que los arrays tengan datos
        const temps = data.Temp || [];
        const humidities = data.Humedad || [];
        const pressures = data.Presion || [];
        const luxValues = data.Lux || [];

        const rainProbability = calculateRainProbability(humidities, pressures, temps);

        updateCharts(data,rainProbability);
    } catch (error) {
        console.error('Error al obtener datos:', error);
    }
}

// Función para actualizar los gráficos y datos
function updateCharts(data,r) {
    //console.log('Datos recibidos:', data);

    // Verificar que los arrays tengan datos
    const temps = data.Temp || [];
    const humidities = data.Humedad || [];
    const pressures = data.Presion || [];
    const luxValues = data.Lux || [];

    // Generar timestamps para ejes X si no existen
    const timestamps = temps.map((_, index) => ``);

    // Actualizar gráfico de Temperatura
    temperatureChart.data.labels = timestamps;
    temperatureChart.data.datasets[0].data = temps;
    document.getElementById('temperature-title').innerText = `Temperatura: ${temps.length > 0 ? temps[temps.length - 1].toFixed(1) : 'N/A'}°C`;
    temperatureChart.update();

    // Actualizar gráfico de Humedad
    const lastHumidity = humidities.length > 0 ? humidities[humidities.length - 1] : 0;
    humidityChart.data.datasets[0].data = [lastHumidity, 100 - lastHumidity];
    document.getElementById('humidity-title').innerText = `Humedad: ${lastHumidity.toFixed(1)}%`;
    humidityChart.update();

    // Actualizar gráfico de Presión
    pressureChart.data.labels = timestamps;
    pressureChart.data.datasets[0].data = pressures;
    document.getElementById('pressure-title').innerText = `Presión: ${pressures.length > 0 ? pressures[pressures.length - 1].toFixed(1) : 'N/A'} hPa`;
    pressureChart.update();

    // Actualizar gráfico de Intensidad Lumínica
    lightChart.data.labels = timestamps;
    lightChart.data.datasets[0].data = luxValues;
    document.getElementById('light-title').innerText = `Intensidad Lumínica: ${luxValues.length > 0 ? luxValues[luxValues.length - 1].toFixed(1) : 'N/A'} lux`;
    lightChart.update();

    // Actualizar gráfico de Probabilidad de Lluvia
    console.log('Humidities:', humidities);
    console.log('Pressures:', pressures);
    console.log('Temperatures:', temps);

    const rainProbability = r;
    console.log('Probabilidad de lluvia calculada:', rainProbability);

    document.getElementById('rain-title').innerText = `Probabilidad de Lluvia: ${rainProbability}%`;

}

// Llamada inicial y repetición cada 2 segundos
fetchData();
setInterval(fetchData, 1000);