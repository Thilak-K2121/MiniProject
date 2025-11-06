// src/pages/About.jsx
export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6 text-white/90 text-lg">
      <h1 className="text-4xl font-bold text-center text-cosmic-accent mb-8">
        About NebulaLens
      </h1>
      
      <div className="bg-cosmic-card/70 backdrop-blur-md p-8 rounded-2xl border border-white/10 space-y-6 text-left">
        <p>
          <strong>NebulaLens</strong> is a full-stack web application designed to
          bridge the gap between complex astronomical data and the power of
          machine learning. Our project, born from a desire to make astrophysics
          more accessible, leverages a dataset of celestial objects to classify
          them into categories like Stars, Quasars, or Galaxies.
        </p>
        
        <h2 className="text-2xl font-semibold text-cosmic-accent">Our Mission</h2>
        <p>
          The universe is vast, and the data we collect from it is even vaster.
          Manually classifying every observed object is impossible. Our mission
          is to demonstrate how different machine learning models can be trained
          to perform this classification automatically, comparing their performance
          to understand the best-suited algorithms for the task.
        </p>

        <h2 className="text-2xl font-semibold text-cosmic-accent">The Technology</h2>
        <p>
          This project compares four distinct classification models:
        </p>
        <ul className="list-disc list-inside pl-4 space-y-2">
          <li><strong>Support Vector Machine (SVM):</strong> A powerful model that finds the optimal hyperplane to separate data points.</li>
          <li><strong>Random Forest (RF):</strong> An ensemble method that builds multiple decision trees and merges them for a more accurate and stable prediction.</li>
          <li><strong>Multi-Layer Perceptron (MLP):</strong> A classic neural network, serving as a foundation for deep learning, capable of learning complex, non-linear patterns.</li>
          <li><strong>K-Nearest Neighbors (KNN):</strong> A simple, instance-based learning algorithm that classifies objects based on the majority class of their nearest neighbors.</li>
        </ul>
        <p>
          The frontend is built with <strong>React</strong> and <strong>Tailwind CSS</strong>, 
          while the backend is powered by a <strong>FastAPI</strong> server in Python,
          serving the pre-trained models.
        </p>
      </div>
    </div>
  );
}