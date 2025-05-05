import { 
  Candidate, 
  VotePercentages, 
  CandidateIdeology, 
  IdeologyModifiers, 
  PreferenceMatrix,
  RoundResult,
  Winner,
  IdeologyType
} from '../types';

/**
 * Calculate preference matrix based on initial votes and ideological modifiers
 */
export const calculatePreferenceMatrix = (
  candidates: Candidate[],
  initialVotesData: VotePercentages,
  candidateIdeology: CandidateIdeology,
  ideologyModifiers: IdeologyModifiers
): PreferenceMatrix => {
  const matrix: PreferenceMatrix = {};
  
  candidates.forEach(voter => {
    matrix[voter] = {};
    
    // Get ideological group of the voter
    const voterIdeology = candidateIdeology[voter];
    const modifiers = ideologyModifiers[voterIdeology];
    
    // Calculate base preferences from initial vote percentages, but exclude self
    const otherCandidates = candidates.filter(c => c !== voter);
    const otherTotalVotes = otherCandidates.reduce((sum, c) => sum + (initialVotesData[c] || 0), 0);
    
    otherCandidates.forEach(ranked => {
      // Base preference is proportional to initial vote percentage
      let basePreference = otherTotalVotes > 0 ? (initialVotesData[ranked] || 0) / otherTotalVotes * 100 : 0;
      
      // Apply ideological modifier
      const modifier = modifiers[ranked];
      let adjustedPreference = basePreference * (1 + modifier);
      
      // Ensure preference is not negative
      matrix[voter][ranked] = Math.max(0, adjustedPreference);
    });
    
    // Normalize to ensure preferences for each voter sum to 100
    const total = Object.values(matrix[voter]).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(matrix[voter]).forEach(ranked => {
        matrix[voter][ranked] = (matrix[voter][ranked] / total) * 100;
      });
    }
  });
  
  return matrix;
};

/**
 * Run the RCV simulation and return results
 */
export const runRCVSimulation = (
  candidates: Candidate[],
  normalizedVotes: VotePercentages,
  exhaustionRates: VotePercentages,
  preferenceMatrix: PreferenceMatrix
): { results: RoundResult[], winner: Winner | null } => {
  // Initialize votes with normalized initial percentages
  let currentRound: VotePercentages = {};
  candidates.forEach(candidate => {
    currentRound[candidate] = normalizedVotes[candidate];
  });

  // Ensure initial vote total is exactly 100%
  const initialTotal = Object.values(currentRound).reduce((sum, val) => sum + val, 0);
  if (Math.abs(initialTotal - 100) > 0.0001) {
    const adjustmentFactor = 100 / initialTotal;
    candidates.forEach(candidate => {
      currentRound[candidate] *= adjustmentFactor;
    });
  }

  let previousRound: VotePercentages | null = null;
  let previousRoundPercentages: VotePercentages | null = null;
  let roundResults: RoundResult[] = [];
  let activeCandidates = [...candidates];
  let roundNumber = 1;
  let initialTotalVotes = 100; // Start with 100% of initial votes
  let currentTotalVotes = initialTotalVotes;
  let winner: Winner | null = null;

  // Continue until a candidate has majority or only one candidate remains
  while (activeCandidates.length > 1) {
    // Store previous round data to calculate gains
    previousRound = roundResults.length > 0 ? { ...roundResults[roundResults.length - 1].votes } : null;
    previousRoundPercentages = roundResults.length > 0 ? { ...roundResults[roundResults.length - 1].remainingPercentages } : null;
    
    // Calculate active votes total (should equal currentTotalVotes, but calculate to be sure)
    const activeVotesTotal = activeCandidates.reduce((sum, candidate) => sum + currentRound[candidate], 0);
    
    // Calculate percentages of remaining ballots
    const remainingPercentages: VotePercentages = {};
    activeCandidates.forEach(candidate => {
      remainingPercentages[candidate] = activeVotesTotal > 0 
        ? (currentRound[candidate] / activeVotesTotal) * 100 
        : 0;
    });
    
    // Calculate gains from previous round
    const votesGained: VotePercentages = {};
    
    candidates.forEach(candidate => {
      if (previousRound) {
        votesGained[candidate] = currentRound[candidate] - (previousRound[candidate] || 0);
      } else {
        votesGained[candidate] = 0;
      }
    });
    
    // Add current round to results
    roundResults.push({
      round: roundNumber,
      votes: {...currentRound},
      remainingPercentages: {...remainingPercentages},
      previousRoundPercentages: previousRoundPercentages ? {...previousRoundPercentages} : undefined,
      votesGained,
      eliminated: null,
      totalVotesRemaining: currentTotalVotes,
      activeVotesTotal: activeVotesTotal
    });

    // Find candidate with lowest votes
    let lowestVotes = Infinity;
    let lowestCandidate: string | null = null;
    
    activeCandidates.forEach(candidate => {
      if (currentRound[candidate] < lowestVotes) {
        lowestVotes = currentRound[candidate];
        lowestCandidate = candidate;
      }
    });
    
    // In case of a tie for lowest votes, use deterministic method to break tie
    if (activeCandidates.filter(c => currentRound[c] === lowestVotes).length > 1) {
      // Find all candidates tied for lowest
      const tiedCandidates = activeCandidates.filter(c => currentRound[c] === lowestVotes);
      
      // Use alphabetical order as tiebreaker to ensure consistent results
      tiedCandidates.sort();
      lowestCandidate = tiedCandidates[0];
    }

    // Check if any candidate has majority of remaining votes
    const hasWinner = activeCandidates.some(candidate => 
      remainingPercentages[candidate] > 50
    );
    
    if (hasWinner) {
      let winningCandidate: string | null = null;
      let highestVotes = 0;
      let highestRemaining = 0;
      
      activeCandidates.forEach(candidate => {
        if (currentRound[candidate] > highestVotes) {
          highestVotes = currentRound[candidate];
          highestRemaining = remainingPercentages[candidate];
          winningCandidate = candidate;
        }
      });
      
      if (winningCandidate) {
        winner = {
          candidate: winningCandidate,
          votes: highestVotes,
          percentage: highestVotes, // % of initial ballots
          remainingPercentage: highestRemaining, // % of remaining ballots
          finalRound: roundNumber,
          totalInitialVotes: initialTotalVotes,
          totalRemainingVotes: currentTotalVotes
        };
      }
      
      if (lowestCandidate) {
        roundResults[roundResults.length - 1].eliminated = lowestCandidate;
        roundResults[roundResults.length - 1].isLastRound = true;
      }
      
      return { results: roundResults, winner };
    }

    // No winner yet, so eliminate lowest candidate
    if (lowestCandidate) {
      const eliminatedVotes = currentRound[lowestCandidate];
      const exhaustionRate = exhaustionRates[lowestCandidate] / 100;
      const votesToRedistribute = eliminatedVotes * (1 - exhaustionRate);
      const exhaustedVotes = eliminatedVotes * exhaustionRate;
      
      // Update total votes remaining (subtract exhausted ballots)
      currentTotalVotes -= exhaustedVotes;
      
      // Update list of active candidates before redistributing votes
      activeCandidates = activeCandidates.filter(c => c !== lowestCandidate);
      
      // Distribute votes from eliminated candidate
      const nextRound = {...currentRound};
      nextRound[lowestCandidate] = 0;
      
      // Get the preferences for the eliminated candidate, but only for active candidates
      const rawPreferences: VotePercentages = {};
      let totalRawPreference = 0;
      
      // TypeScript needs this check even though we already checked above
      const candidate = lowestCandidate; // Non-null assertion for TypeScript
      activeCandidates.forEach(otherCandidate => {
        rawPreferences[otherCandidate] = preferenceMatrix[candidate][otherCandidate];
        totalRawPreference += rawPreferences[otherCandidate];
      });
      
      // Normalize these preferences to ensure they sum to 100% among active candidates
      activeCandidates.forEach(candidate => {
        // If there are no preferences for active candidates, distribute evenly
        if (totalRawPreference <= 0) {
          const redistributedVotes = votesToRedistribute / activeCandidates.length;
          nextRound[candidate] += redistributedVotes;
        } else {
          // Otherwise distribute according to normalized preferences
          const normalizedPreference = rawPreferences[candidate] / totalRawPreference;
          const redistributedVotes = votesToRedistribute * normalizedPreference;
          nextRound[candidate] += redistributedVotes;
        }
      });
      
      // Reconcile vote totals to address floating-point precision issues
      const calculatedTotal = activeCandidates.reduce((sum, candidate) => sum + nextRound[candidate], 0);
      if (Math.abs(calculatedTotal - currentTotalVotes) > 0.0001) {
        const adjustmentFactor = currentTotalVotes / calculatedTotal;
        activeCandidates.forEach(candidate => {
          nextRound[candidate] *= adjustmentFactor;
        });
      }
      
      // Mark eliminated candidate in this round's results
      roundResults[roundResults.length - 1].eliminated = lowestCandidate;
      roundResults[roundResults.length - 1].exhaustedVotes = exhaustedVotes;
      roundResults[roundResults.length - 1].votesToRedistribute = votesToRedistribute;
      
      // Move to next round
      currentRound = nextRound;
      roundNumber++;
    }
  }

  // If we get here, only one candidate remains
  if (activeCandidates.length === 1) {
    const finalCandidate = activeCandidates[0];
    const finalVotes = currentRound[finalCandidate];
    
    // Store previous round data to calculate gains
    const prevRound = roundResults.length > 0 ? { ...roundResults[roundResults.length - 1].votes } : null;
    const prevRoundPercentages = roundResults.length > 0 ? { ...roundResults[roundResults.length - 1].remainingPercentages } : null;
    
    // Calculate gains from previous round
    const votesGained: VotePercentages = {};
    
    candidates.forEach(candidate => {
      if (prevRound) {
        votesGained[candidate] = currentRound[candidate] - (prevRound[candidate] || 0);
      } else {
        votesGained[candidate] = 0;
      }
    });
    
    // Calculate final percentages
    const initialPercentage = finalVotes;
    const remainingPercentage = 100; // Only one candidate left, so 100%
    
    // Add final round to results
    roundResults.push({
      round: roundNumber,
      votes: {...currentRound},
      remainingPercentages: {
        [finalCandidate]: 100
      },
      previousRoundPercentages: prevRoundPercentages || undefined,
      votesGained,
      eliminated: null,
      isLastRound: true,
      totalVotesRemaining: currentTotalVotes,
      activeVotesTotal: finalVotes
    });
    
    winner = {
      candidate: finalCandidate,
      votes: finalVotes,
      percentage: initialPercentage, // % of initial ballots
      remainingPercentage: remainingPercentage, // % of remaining ballots
      finalRound: roundNumber,
      totalInitialVotes: initialTotalVotes,
      totalRemainingVotes: currentTotalVotes
    };
  }
  
  return { results: roundResults, winner };
};

/**
 * Export simulation results to CSV
 */
export const exportToCSV = (
  results: RoundResult[],
  candidates: Candidate[],
  abridged = false
): void => {
  if (!results || results.length === 0) return;
  
  // Determine which rounds to include based on whether it's abridged
  const roundsToInclude = abridged 
    ? results.filter((_, index, arr) => {
        // Include the first round, last two rounds, and any round where 
        // a significant candidate was eliminated (or every 3rd round)
        return index === 0 || // First round
               index >= arr.length - 2 || // Last two rounds
               index % 3 === 0; // Every third round
      }).map(r => r.round)
    : results.map(r => r.round);
  
  // Build CSV header row with round numbers
  let csvContent = "Candidate,First Round";
  roundsToInclude.slice(1).forEach(roundNum => {
    csvContent += `,Round ${roundNum}`;
  });
  csvContent += "\n";
  
  // For each candidate, add a row with their percentages across rounds
  candidates
    .filter(candidate => results[0].votes[candidate] > 0) // Only include candidates who started with votes
    .sort((a, b) => results[0].votes[b] - results[0].votes[a]) // Sort by initial vote count
    .forEach(candidate => {
      csvContent += `${candidate},${results[0].remainingPercentages[candidate]?.toFixed(1) || 0}`;
      
      // Add data for each round
      roundsToInclude.slice(1).forEach(roundNum => {
        const roundData = results.find(r => r.round === roundNum);
        if (!roundData) {
          csvContent += `,—`;
          return;
        }
        
        // If candidate was already eliminated, show dash
        if (roundData.votes[candidate] === 0) {
          csvContent += `,—`;
        } else {
          csvContent += `,${roundData.remainingPercentages[candidate]?.toFixed(1) || 0}`;
        }
      });
      csvContent += "\n";
    });
  
  // Add ballot exhaustion information
  csvContent += `\nBallots Remaining,100.0`;
  roundsToInclude.slice(1).forEach(roundNum => {
    const roundData = results.find(r => r.round === roundNum);
    if (roundData) {
      csvContent += `,${roundData.totalVotesRemaining.toFixed(1)}`;
    } else {
      csvContent += `,—`;
    }
  });
  
  csvContent += `\nBallots Exhausted,0.0`;
  roundsToInclude.slice(1).forEach(roundNum => {
    const roundData = results.find(r => r.round === roundNum);
    if (roundData) {
      csvContent += `,${(100 - roundData.totalVotesRemaining).toFixed(1)}`;
    } else {
      csvContent += `,—`;
    }
  });
  
  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', abridged ? 'rcv_results_abridged.csv' : 'rcv_results_full.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};