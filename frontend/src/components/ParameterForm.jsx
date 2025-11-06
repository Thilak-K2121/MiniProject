// src/components/ParameterForm.jsx
import { useState } from 'react';
import axios from 'axios';

// The 6 *correct* features
const parameters = [
  { name: 'u', placeholder: 'u (Ultraviolet filter)' },
  { name: 'g', placeholder: 'g (Green filter)' },
  { name: 'r', placeholder: 'r (Red filter)' },
  { name: 'i', placeholder: 'i (Near-Infrared filter)' },
  { name: 'z', placeholder: 'z (Infrared filter)' },
  { name: 'redshift', placeholder: 'Redshift' },
];

// Create the initial state
const initialState = parameters.reduce((acc, param) => {
  acc[param.name] = '';
  return acc;
}, {});

export default function ParameterForm({ setIsLoading, setApiResult }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? Number(value) : '' 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiResult(null); 

    try {
      // Send data to the FastAPI backend (it expects 6 features)
      const response = await axios.post('http://127.0.0.1:8000/predict', formData);
      setApiResult(response.data); 
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setApiResult({ error: "Failed to get prediction." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cosmic-card/70 backdrop-blur-md p-6 rounded-2xl border border-white/10">
      <h2 className="text-left font-semibold text-lg mb-4">Enter Object Parameters</h2>
      
      <form onSubmit={handleSubmit}>
        {/* We updated the grid to be 3x2, which is cleaner for 6 items */}
        <div className="grid grid-cols-2 gap-4">
          {parameters.map((param) => (
            <input
              key={param.name}
              type="number"
              name={param.name}
              placeholder={param.placeholder}
              value={formData[param.name]}
              onChange={handleChange}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-cosmic-accent"
              step="any" 
              required
            />
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-white/50 text-left">
            Enter all 6 features to predict.
          </p>
          <button 
            type="submit" 
            className="bg-cosmic-accent text-black px-6 py-2 rounded-lg font-semibold hover:shadow-glow transition"
          >
            Predict
          </button>
        </div>
      </form>
    </div>
  );
}