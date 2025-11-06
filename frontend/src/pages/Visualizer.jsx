// src/pages/Visualizer.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// This is the placeholder data from your backend.
// In a real app, you might fetch this from a /metrics endpoint.
const performanceMetrics = {
  svm: { accuracy: 0.92, precision: 0.91, recall: 0.92, f1_score: 0.91 },
  mlp: { accuracy: 0.95, precision: 0.94, recall: 0.95, f1_score: 0.94 },
  knn: { accuracy: 0.89, precision: 0.88, recall: 0.89, f1_score: 0.88 },
  rf: { accuracy: 0.97, precision: 0.97, recall: 0.97, f1_score: 0.97 }
};

const labels = Object.keys(performanceMetrics);

const chartData = {
  labels,
  datasets: [
    {
      label: 'Accuracy',
      data: labels.map(model => performanceMetrics[model].accuracy),
      backgroundColor: 'rgba(59, 130, 246, 0.7)', // A blueish color
    },
    {
      label: 'F1-Score',
      data: labels.map(model => performanceMetrics[model].f1_score),
      backgroundColor: 'rgba(234, 179, 8, 0.7)', // Your "cosmic-accent" yellow
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.8)'
      }
    },
    title: {
      display: true,
      text: 'Model Performance Comparison (Test Set)',
      color: 'rgba(255, 255, 255, 0.9)',
      font: {
        size: 18
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 1.0,
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    x: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
};

export default function Visualizer() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-bold text-center text-cosmic-accent mb-8">
        Model Visualizer
      </h1>
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10">
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}