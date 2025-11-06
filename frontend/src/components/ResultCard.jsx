// src/components/ResultCard.jsx
export default function ResultCard({ predictions, isLoading }) {
  
  // Show a loading or placeholder state
  if (isLoading) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[150px]">
        <h2 className="font-semibold text-lg mb-4">Prediction Result</h2>
        <p className="text-white/70">Analyzing...</p>
      </div>
    );
  }

  // Show before any prediction is made
  if (!predictions) {
    return (
      <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[150px]">
        <h2 className="font-semibold text-lg mb-4">Prediction Result</h2>
        <p className="text-white/50 text-sm">Enter parameters to see results.</p>
      </div>
    );
  }

  // Show the prediction results
  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h2 className="font-semibold text-lg mb-4 text-left">Model Predictions</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Map over the predictions object {svm: "STAR", rf: "QSO", ...} */}
        {Object.entries(predictions).map(([modelName, prediction]) => (
          <div key={modelName} className="bg-black/30 p-3 rounded-lg border border-white/10">
            <span className="text-xs text-white/60 uppercase">{modelName}</span>
            <p className="text-xl font-bold text-cosmic-accent">{prediction}</p>
          </div>
        ))}
      </div>
    </div>
  );
}