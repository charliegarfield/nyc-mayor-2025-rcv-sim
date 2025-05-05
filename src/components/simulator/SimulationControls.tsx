import React from 'react';
import { RoundResult } from '../../types';
import { exportToCSV } from '../../utils/simulation';

interface SimulationControlsProps {
  runSimulation: () => void;
  results: RoundResult[];
  candidates: string[];
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ 
  runSimulation, 
  results, 
  candidates 
}) => {
  return (
    <div className="flex justify-center space-x-4 mb-6">
      <button
        onClick={runSimulation}
        className="bg-blue-600 text-white px-4 py-2 rounded font-bold"
      >
        Run Simulation
      </button>
      
      {results.length > 0 && (
        <div className="flex space-x-2">
          <button
            onClick={() => exportToCSV(results, candidates, false)}
            className="bg-green-600 text-white px-3 py-2 rounded font-bold flex items-center"
            title="Export complete results with all rounds"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Full CSV
          </button>
          
          <button
            onClick={() => exportToCSV(results, candidates, true)}
            className="bg-green-700 text-white px-3 py-2 rounded font-bold flex items-center"
            title="Export abridged results with key rounds only"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Abridged CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default SimulationControls;