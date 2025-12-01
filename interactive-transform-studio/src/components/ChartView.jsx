import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const binData = (data, column, bins = 10) => {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    if (values.length === 0) return { labels: [], counts: [] };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const step = range / bins;

    const counts = new Array(bins).fill(0);
    const labels = new Array(bins).fill(0).map((_, i) => (min + i * step).toFixed(2));

    values.forEach(v => {
        let bucket = Math.floor((v - min) / step);
        if (bucket >= bins) bucket = bins - 1;
        counts[bucket]++;
    });

    return { labels, counts };
};

export const ChartView = ({ data, column }) => {
    const chartData = useMemo(() => {
        if (!column || !data.length) return null;
        const { labels, counts } = binData(data, column);

        return {
            labels,
            datasets: [
                {
                    label: `Distribution of ${column}`,
                    data: counts,
                    backgroundColor: 'rgba(56, 189, 248, 0.5)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                },
            ],
        };
    }, [data, column]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#94a3b8' }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    if (!chartData) return <div className="text-center text-slate-500 mt-10">Select a column to view distribution</div>;

    return <Bar options={options} data={chartData} />;
};
