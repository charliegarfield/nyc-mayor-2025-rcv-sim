import React from 'react';
import { Candidate, VotePercentages } from '../../types';

interface InitialVotesProps {
  candidates: Candidate[];
  initialVotes: VotePercentages;
  handleInitialVoteChange: (candidate: Candidate, value: string) => void;
}

const InitialVotes: React.FC<InitialVotesProps> = ({ 
  candidates, 
  initialVotes, 
  handleInitialVoteChange 
}) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">Initial Vote Percentages</h2>
      <p className="text-sm text-gray-600 mb-2">
        Enter the initial percentage of first-choice votes each candidate receives. 
        Changes automatically adjust all candidates to maintain 100%.
      </p>
      
      <div className="grid grid-cols-1 gap-2">
        {candidates
          .sort((a, b) => initialVotes[b] - initialVotes[a])
          .map(candidate => (
          <div key={`initial-${candidate}`} className="flex items-center">
            <label className="inline-block w-32 sm:w-40 text-sm">{candidate}:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={initialVotes[candidate].toFixed(1)}
              onChange={(e) => handleInitialVoteChange(candidate, e.target.value)}
              className="w-16 p-1 border rounded"
            />
            <span className="ml-2 text-sm">%</span>
            <div className="ml-3 w-32 bg-gray-200 h-4 rounded overflow-hidden">
              <div 
                className="bg-blue-600 h-full" 
                style={{width: `${initialVotes[candidate]}%`}}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InitialVotes;