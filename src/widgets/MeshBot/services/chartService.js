// services/chartService.js
import { Chart } from 'chart.js';

export function initChart(canvas) {
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: { datasets: [] },
        options: { animation: false },
    });
}

export function updateChart(chart, data) {
    chart.data.datasets = data;
    chart.update();
}

export function destroyChart(chart) {
    if (chart) {
        chart.destroy();
    }
}
