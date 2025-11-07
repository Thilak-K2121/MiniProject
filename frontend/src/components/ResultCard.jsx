import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- NEW: Typewriter hook (to reuse logic) ---
const useTypewriter = () => {
  const [fullText, setFullText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (fullText) {
      setIsTyping(true);
      setDisplayedText("");
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setDisplayedText((prev) => prev + fullText.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20); // Typing speed
      return () => clearInterval(interval);
    }
  }, [fullText]);

  return { displayedText, setFullText, isTyping };
};

// --- NEW: Anomaly Analyzer Component ---
// This is the UI for a low-confidence "Anomaly"
const AnomalyAnalyzer = ({ apiResult }) => {
  const { predictions, inputFeatures, average_confidence } = apiResult;
  const { displayedText: geminiExplanation, setFullText: setGeminiExplanation, isTyping } = useTypewriter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnomalyAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setGeminiExplanation(""); // Clear old text
    try {
      const response = await axios.post('http://127.0.0.1:8000/analyze-anomaly', {
        inputs: inputFeatures,
        probabilities: predictions // Send all the confusing scores
      });
      if (response.data.explanation) {
        setGeminiExplanation(response.data.explanation);
      } else {
        setError(response.data.error || "Failed to get explanation.");
      }
    } catch (err) {
      setError("Failed to contact API.");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-red-900/30 backdrop-blur-md p-6 rounded-2xl border border-red-400 text-left">
      <h2 className="font-semibold text-2xl text-red-300">Anomaly Detected!</h2>
      <p className="text-sm text-white/80 mt-2">
        The models are highly uncertain about this object. The average prediction confidence is only 
        <strong className="text-white"> {(average_confidence * 100).toFixed(1)}%</strong>.
      </p>
      <p className="text-sm text-white/80 mt-1">
        This could be a rare object, an anomaly, or contradictory data.
      </p>
      
      {/* Gemini Analysis Section */}
      <div className="mt-4 pt-4 border-t border-red-400/50">
        {!geminiExplanation && !isLoading && !error && (
          <button 
            onClick={fetchAnomalyAnalysis}
            className="bg-red-300 text-black px-4 py-2 rounded-lg font-semibold hover:bg-white transition"
          >
            Ask Gemini to Analyze Anomaly
          </button>
        )}
        {isLoading && (
          <p className="text-sm text-red-200 animate-pulse">Gemini is analyzing the anomaly...</p>
        )}
        {error && (
          <p className="text-sm text-red-200">{error} <button onClick={fetchAnomalyAnalysis} className="text-xs text-white/70 underline ml-1">Try again</button></p>
        )}
        {geminiExplanation && (
          <div className="p-3 bg-black/30 rounded-lg border border-white/10">
            <h3 className="font-semibold text-md mb-2 text-white">Gemini's Hypothesis</h3>
            <p className="text-sm text-white/80">
              {geminiExplanation}
              {isTyping && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Default Prediction UI Component ---
// This is your normal UI for a *confident* prediction
const DefaultPredictionUI = ({ apiResult }) => {
  const { predictions, modelAgreement, inputFeatures } = apiResult;
  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col justify-start text-left">
      <AgreementSection agreement={modelAgreement} />
      
      {!modelAgreement.prediction === "Error" && inputFeatures && (
        <DynamicExplanation
          inputs={inputFeatures}
          prediction={modelAgreement.prediction}
        />
      )}
      
      {!modelAgreement.prediction === "Error" && (
        <AstroPedia objectName={modelAgreement.prediction} />
      )}
      
      <BreakdownSection predictions={predictions} />
    </div>
  );
};


// --- Main ResultCard Component ---
export default function ResultCard({ apiResult, isLoading }) {
  
  if (isLoading) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
        <h2 className="font-semibold text-lg text-white/80">Analyzing...</h2>
      </div>
    );
  }

  if (!apiResult || apiResult.error) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
        <h2 className="font-semibold text-lg mb-4">Prediction Result</h2>
        <p className="text-white/50 text-sm">Enter parameters to see results.</p>
        {apiResult?.error && <p className="text-red-400 mt-2">{apiResult.error}</p>}
      </div>
    );
  }

  // --- THIS IS THE CORE LOGIC ---
  // It checks the flag from the API and renders the correct UI
  return apiResult.is_anomaly ? 
    <AnomalyAnalyzer apiResult={apiResult} /> : 
    <DefaultPredictionUI apiResult={apiResult} />;
}


// --- Helper Components ---
// (These are all the components we built in the previous steps)

const AstroPedia = ({ objectName }) => {
  const { displayedText, setFullText, isTyping } = useTypewriter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExplanation = async () => {
    setIsLoading(true);
    setError(null);
    setFullText("");
    try {
      const response = await axios.post('http://127.0.0.1:8000/get-explanation', {
        object_name: objectName
      });
      if (response.data.explanation) {
        setFullText(response.data.explanation);
      } else {
        setError(response.data.error || "Failed to get explanation.");
      }
    } catch (err) {
      setError("Failed to contact API.");
    }
    setIsLoading(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h3 className="font-semibold text-md mb-2">Astro-Pedia</h3>
      {displayedText && (
        <div className="p-3 bg-black/30 rounded-lg border border-white/10">
          <p className="text-sm text-white/80">
            {displayedText}
            {isTyping && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}
          </p>
        </div>
      )}
      {!displayedText && !isLoading && !error && (
        <button 
          onClick={fetchExplanation}
          className="text-sm font-semibold text-cosmic-accent hover:underline"
        >
          What is a {objectName}?
        </button>
      )}
      {isLoading && (
        <p className="text-sm text-cosmic-accent animate-pulse">Asking Gemini...</p>
      )}
      {error && !isLoading && (
        <p className="text-sm text-red-400">{error} <button onClick={fetchExplanation} className="text-xs text-white/70 underline ml-1">Try again</button></p>
      )}
    </div>
  );
};

const DynamicExplanation = ({ inputs, prediction }) => {
  const { displayedText, setFullText, isTyping } = useTypewriter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLoading(true);
      setError(null);
      setFullText("");
      try {
        const response = await axios.post('http://127.0.0.1:8000/dynamic-explanation', {
          inputs: inputs,
          prediction: prediction
        });
        if (response.data.explanation) {
          setFullText(response.data.explanation);
        } else {
          setError(response.data.error || "Failed to get explanation.");
        }
      } catch (err) {
        setError("Failed to contact API.");
      }
      setIsLoading(false);
    };
    fetchExplanation();
  }, [inputs, prediction]);

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      <h3 className="font-semibold text-md mb-2">Dynamic AI Explanation</h3>
      <div className="p-3 bg-black/30 rounded-lg border border-white/10">
        {isLoading && (
          <p className="text-sm text-cosmic-accent animate-pulse">
            Gemini is analyzing this specific prediction...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {displayedText && (
          <p className="text-sm text-white/80">
            {displayedText}
            {isTyping && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}
          </p>
        )}
      </div>
    </div>
  );
};

const ProbabilityBreakdown = ({ probabilities }) => {
  const sortedProbs = Object.entries(probabilities).sort(([, probA], [, probB]) => probB - probA);
  return (
    <div className="space-y-2 mt-2">
      {sortedProbs.map(([className, prob]) => (
        <div key={className} className="text-xs">
          <div className="flex justify-between text-white/70 mb-0.5">
            <span>{className}</span><span>{(prob * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-1.5 border border-white/10">
            <div className="bg-cosmic-accent h-full rounded-full" style={{ width: `${prob * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BreakdownSection = ({ predictions }) => (
  <div className="mt-4 pt-4 border-t border-white/10">
    <h3 className="font-semibold text-md">Model Confidence Breakdown</h3>
    <div className="grid grid-cols-2 gap-4 mt-3">
      {Object.entries(predictions).map(([modelName, data]) => (
        <div key={modelName} className="bg-black/30 p-3 rounded-lg border border-white/10">
          <span className="text-sm font-semibold text-white/90 uppercase">{modelName}</span>
          {data.prediction === "Error" ? (
            <p className="text-red-400 text-xs mt-1">Prediction Error.</p>
          ) : (
            <>
              <div className="text-lg font-bold text-cosmic-accent mt-1">{data.prediction}</div>
              <div className="text-xs text-white/70">Confidence: {(data.confidence * 100).toFixed(1)}%</div>
              <ProbabilityBreakdown probabilities={data.probabilities} />
            </>
          )}
        </div>
      ))}
    </div>
  </div>
);

const AgreementSection = ({ agreement }) => (
  <>
    <h2 className="font-semibold text-lg mb-2">Consensus Result</h2>
    <p className="text-sm text-white/70">
      <strong className="text-white">{agreement.count} out of {agreement.total}</strong> models agree.
    </p>
    <div className="text-4xl font-bold text-cosmic-accent my-3">
      {agreement.prediction}
    </div>
  </>
);