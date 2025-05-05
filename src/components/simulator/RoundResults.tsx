import React from 'react';
import { Candidate, RoundResult } from '../../types';

interface RoundResultsProps {
  results: RoundResult[];
  candidates: Candidate[];
}

const RoundResults: React.FC<RoundResultsProps> = ({ results, candidates }) => {
  if (results.length === 0) return null;
  
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-4">Round-by-Round Results</h2>
      
      <div className="space-y-6">
        {results.map((round) => (
          <div 
            key={`round-${round.round}`} 
            className={`p-3 rounded border ${round.isLastRound ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
          >
            <h3 className="font-bold text-lg mb-2 border-b pb-1">
              Round {round.round}
              {round.isLastRound && " (Final)"}
              {round.eliminated && !round.isLastRound && (
                <span>
                  {` - ${round.eliminated} eliminated `}
                  <span className="font-normal text-sm">
                    ({round.votesToRedistribute?.toFixed(2)}% redistributed)
                  </span>
                </span>
              )}
            </h3>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">
                {round.totalVotesRemaining.toFixed(2)}% of initial ballots remain active 
                ({(100 - round.totalVotesRemaining).toFixed(2)}% exhausted)
              </p>
            </div>
            
            <div className="space-y-3">
              {candidates
                .filter(candidate => round.votes[candidate] > 0)
                .sort((a, b) => round.votes[b] - round.votes[a])
                .map(candidate => (
                <div key={`round-${round.round}-${candidate}`} className="relative">
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <span className={`font-semibold ${
                        round.eliminated === candidate && !round.isLastRound ? 'line-through text-red-500' : ''
                      }`}>
                        {candidate}
                      </span>
                      {round.eliminated === candidate && !round.isLastRound && (
                        <span className="ml-2 text-xs text-red-500 font-semibold">ELIMINATED</span>
                      )}
                      {round.previousRoundPercentages && round.previousRoundPercentages[candidate] && (
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          +{(round.remainingPercentages[candidate] - round.previousRoundPercentages[candidate]).toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      <span>{round.remainingPercentages[candidate]?.toFixed(2) || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden relative">
                    {/* Base blue bar */}
                    {round.previousRoundPercentages && round.previousRoundPercentages[candidate] ? (
                      <>
                        {/* Base votes (blue bar) - previous percentage */}
                        <div 
                          className="h-full bg-blue-600 absolute left-0"
                          style={{
                            width: `${round.previousRoundPercentages[candidate]}%`
                          }}
                        ></div>
                        
                        {/* Only show green if there was an increase */}
                        {round.remainingPercentages[candidate] > round.previousRoundPercentages[candidate] && (
                          <div 
                            className="h-full bg-green-500 absolute"
                            style={{
                              left: `${round.previousRoundPercentages[candidate]}%`,
                              width: `${round.remainingPercentages[candidate] - round.previousRoundPercentages[candidate]}%`
                            }}
                          ></div>
                        )}
                      </>
                    ) : (
                      // If first round or no previous data, just show blue bar
                      <div 
                        className="h-full bg-blue-600"
                        style={{width: `${round.remainingPercentages[candidate]}%`}}
                      ></div>
                    )}
                  </div>
                  
                  {round.remainingPercentages[candidate] > 50 && (
                    <div className="absolute top-0 bottom-0 left-1/2 border-l-2 border-green-500 border-dashed">
                      <span className="absolute -top-4 -left-6 text-xs text-green-600 font-semibold">
                        50% THRESHOLD
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {round.eliminated && round.exhaustedVotes && round.exhaustedVotes > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                <p>{round.exhaustedVotes.toFixed(2)}% of ballots exhausted this round</p>
                {round.votesToRedistribute && <p>{round.votesToRedistribute.toFixed(2)}% redistributed to other candidates</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoundResults;