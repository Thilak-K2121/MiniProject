import { useState } from "react";
import ParameterForm from "../components/ParameterForm";
import MetricsCard from "../components/MetricsCard";
import ResultCard from "../components/ResultCard";
import PredictionLog from "../components/PredictionLog";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [predictionLog, setPredictionLog] = useState([]);

  const hasResult = apiResult && !apiResult.error;

  return (
    <section className="flex flex-col items-center text-center px-6 py-16">
      
      {/* --- THIS IS THE UPDATED H1 --- */}
      <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-white">
        <span className="text-[#00c4ff]">NebulaLens</span>: Decoding the Universe with Machine Learning
      </h1>

      <p className="text-white/70 mb-12 max-w-2xl">
        Enter the 6 object parameters to predict its class, or use the sliders
        to experiment with "what-if" scenarios.
      </p>

      <div className="max-w-5xl w-full space-y-8">
        
        {/* --- 1. Top Section: Form + Metrics --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ParameterForm 
            setIsLoading={setIsLoading} 
            setApiResult={setApiResult} 
            setPredictionLog={setPredictionLog}
          />
          <MetricsCard 
            performance={apiResult?.performance} 
            isLoading={isLoading} 
          />
        </div>

        {/* --- 2. Result Section (Full-Width) --- */}
        {(isLoading || hasResult) && (
          <div className="w-full">
            <ResultCard 
              apiResult={apiResult}
              isLoading={isLoading} 
            />
          </div>
        )}

        {/* --- 3. Prediction Log Section (Full-Width) --- */}
        <div className="w-full">
          <PredictionLog log={predictionLog} />
        </div>
        
      </div>
    </section>
  );
}