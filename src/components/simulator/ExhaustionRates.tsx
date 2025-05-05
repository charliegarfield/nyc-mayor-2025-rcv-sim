import React from 'react';
import { Candidate, VotePercentages } from '../../types';

interface ExhaustionRatesProps {
  candidates: Candidate[];
  exhaustionRates: VotePercentages;
  handleExhaustionRateChange: (candidate: Candidate, value: string) => void;
}

const ExhaustionRates: React.FC<ExhaustionRatesProps> = ({ 
  candidates, 
  exhaustionRates, 
  handleExhaustionRateChange 
}) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">Ballot Exhaustion Rates</h2>
      <p className="text-sm text-gray-600 mb-2">
        Enter the percentage of ballots that don't continue to the next choice when a candidate is eliminated.
      </p>
      
      <div className="grid grid-cols-1 gap-2">
        {candidates.map(candidate => (
          <div key={`exhaustion-${candidate}`} className="flex items-center">
            <label className="inline-block w-32 sm:w-40 text-sm">{candidate}:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={exhaustionRates[candidate]}
              onChange={(e) => handleExhaustionRateChange(candidate, e.target.value)}
              className="w-16 p-1 border rounded"
            />
            <span className="ml-2 text-sm">%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExhaustionRates;