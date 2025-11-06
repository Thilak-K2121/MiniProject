// src/components/MetricsCard.jsx
export default function MetricsCard({ performance, isLoading }) {
  
  // Default state before data is loaded
  const defaultMetrics = {
    rf: { accuracy: 0.0, f1_score: 0.0 },
    mlp: { accuracy: 0.0, f1_score: 0.0 },
    svm: { accuracy: 0.0, f1_score: 0.0 },
    knn: { accuracy: 0.0, f1_score: 0.0 }
  };
  
  const data = performance || defaultMetrics;

  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h2 className="font-semibold text-lg mb-4 text-left">Model Performance (on Test Set)</h2>
      {isLoading ? (
        <p className="text-white/70 text-sm text-center">Loading...</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(data).map(([modelName, metrics]) => (
            <div key={modelName} className="p-3 bg-black/30 rounded-lg border border-white/10">
              <h3 className="text-sm font-semibold uppercase text-white/90">{modelName}</h3>
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>Accuracy:</span>
                <strong>{(metrics.accuracy * 100).toFixed(1)}%</strong>
              </div>
              <div className="flex justify-between text-xs text-white/70">
                <span>F1-Score:</span>
                <strong>{metrics.f1_score.toFixed(3)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}