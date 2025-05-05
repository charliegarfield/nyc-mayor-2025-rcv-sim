import React from 'react';
import { Winner } from '../../types';

interface WinnerDisplayProps {
  winner: Winner | null;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner }) => {
  if (!winner) return null;
  
  return (
    <div className="bg-green-100 border border-green-300 p-4 rounded shadow mb-6">
      <h2 className="font-bold text-green-800 mb-2 text-xl">Winner: {winner.candidate}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Final vote count:</p>
          <p>{winner.votes.toFixed(2)}% of initial ballots</p>
          <p>{winner.remainingPercentage.toFixed(2)}% of remaining ballots</p>
          <p>Won in round {winner.finalRound}</p>
        </div>
        <div>
          <p className="font-semibold">Ballot exhaustion:</p>
          <p>{(100 - winner.totalRemainingVotes).toFixed(2)}% of ballots exhausted</p>
          <p>{winner.totalRemainingVotes.toFixed(2)}% of ballots remained in final round</p>
        </div>
      </div>
    </div>
  );
};

export default WinnerDisplay;