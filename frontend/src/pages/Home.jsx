// src/pages/Home.jsx
import { useState } from "react";
import ParameterForm from "../components/ParameterForm";
import MetricsCard from "../components/MetricsCard";
import ResultCard from "../components/ResultCard";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  // This state will hold the entire response from your FastAPI backend
  const [apiResult, setApiResult] = useState(null);

  return (
    <section className="flex flex-col items-center text-center px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-white">
        NebulaLens: Decoding the Universe with Machine Learning
      </h1>
      <p className="text-white/70 mb-8 max-w-2xl">
        Enter the 17 object parameters to predict its class using four separate
        ML models.
      </p>
      
      {/* This button isn't necessary if the form is right below,
          but you can keep it to scroll down to the form if you like. */}
      <button className="bg-cosmic-accent text-black px-6 py-3 rounded-lg font-semibold mb-12 hover:shadow-glow transition">
        Predict Now
      </button>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        <ParameterForm 
          setIsLoading={setIsLoading} 
          setApiResult={setApiResult} 
        />
        <div className="flex flex-col gap-6">
          <MetricsCard 
            performance={apiResult?.performance} 
            isLoading={isLoading} 
          />
          <ResultCard 
            predictions={apiResult?.predictions} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </section>
  );
}