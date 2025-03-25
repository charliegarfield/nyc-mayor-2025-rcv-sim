import React, { useState, useEffect } from 'react';

const NYCMayoralPrimarySimulator = () => {
  const candidates = [
    "Eric Adams",
    "Andrew Cuomo",
    "Brad Lander",
    "Adrienne Adams",
    "Jessica Ramos",
    "Zellnor Myrie",
    "Zohran Mamdani",
    "Scott Stringer",
    "Michael Blake",
    "Whitney Tilson"
  ];

  // State for initial vote percentages based on recent polling data
  const [initialVotes, setInitialVotes] = useState({
    "Andrew Cuomo": 33,
    "Eric Adams": 12,
    "Brad Lander": 8,
    "Scott Stringer": 7,
    "Zohran Mamdani": 5,
    "Jessica Ramos": 4,
    "Zellnor Myrie": 3,
    "Adrienne Adams": 3,
    "Michael Blake": 2, 
    "Whitney Tilson": 1
  });

  // Normalize the initial votes when component mounts to ensure they add up to 100%
  useEffect(() => {
    // Calculate the total of initial votes
    const totalInitialVotes = Object.values(initialVotes).reduce((sum, value) => sum + parseFloat(value || 0), 0);
    
    // If not 100%, normalize them
    if (Math.abs(totalInitialVotes - 100) > 0.01) {
      const normalizedInitial = {};
      for (const candidate in initialVotes) {
        normalizedInitial[candidate] = (parseFloat(initialVotes[candidate] || 0) / totalInitialVotes) * 100;
      }
      setInitialVotes(normalizedInitial);
    }
  }, []);

  // State for ballot exhaustion rates based on candidate profiles
  const [exhaustionRates, setExhaustionRates] = useState({
    "Eric Adams": 25,
    "Andrew Cuomo": 22, 
    "Brad Lander": 15,
    "Adrienne Adams": 18,
    "Jessica Ramos": 15,
    "Zellnor Myrie": 17,
    "Zohran Mamdani": 30,
    "Scott Stringer": 16,
    "Michael Blake": 20,
    "Whitney Tilson": 22
  });

  // Normalized initial votes
  const [normalizedVotes, setNormalizedVotes] = useState({});

  // State for simulation results
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);

  // Current candidate being edited in preferences
  const [editingPreferences, setEditingPreferences] = useState(null);
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('candidates');
  
  // Make ideological groups editable
  const [candidateIdeology, setCandidateIdeology] = useState({
    "Zohran Mamdani": "progressive", 
    "Jessica Ramos": "progressive",
    "Zellnor Myrie": "progressive",
    "Brad Lander": "progressive",
    "Scott Stringer": "moderate",
    "Adrienne Adams": "moderate",
    "Michael Blake": "moderate",
    "Whitney Tilson": "conservative",
    "Eric Adams": "conservative",
    "Andrew Cuomo": "moderate"
  });
  
  // Make modifier values editable
  const [ideologyModifiers, setIdeologyModifiers] = useState({
    // Progressive candidates
    "progressive": {
      "Zohran Mamdani": 1, 
      "Jessica Ramos": 1,
      "Zellnor Myrie": 0.8,
      "Brad Lander": 0.8,
      "Scott Stringer": 0.3,
      "Adrienne Adams": -0.2,
      "Michael Blake": -0.3,
      "Whitney Tilson": -0.6,
      "Eric Adams": -0.7,
      "Andrew Cuomo": -0.7
    },
    // Moderate candidates
    "moderate": {
      "Andrew Cuomo": 0.8,
      "Adrienne Adams": 0.7,
      "Eric Adams": 0.6,
      "Scott Stringer": 0.4,
      "Michael Blake": 0.4,
      "Whitney Tilson": 0.3,
      "Brad Lander": -0.2,
      "Zellnor Myrie": -0.3,
      "Jessica Ramos": -0.5,
      "Zohran Mamdani": -0.8
    },
    // Conservative/pro-business candidates
    "conservative": {
      "Eric Adams": 0.9,
      "Whitney Tilson": 0.8,
      "Andrew Cuomo": 0.7,
      "Michael Blake": 0.4,
      "Scott Stringer": 0.1,
      "Adrienne Adams": 0.1,
      "Brad Lander": -0.5,
      "Zellnor Myrie": -0.6,
      "Jessica Ramos": -0.7,
      "Zohran Mamdani": -0.9
    }
  });
  
  // Available ideological groups
  const ideologicalGroups = ["progressive", "moderate", "conservative"];
  
  // Handle change to a candidate's ideological group
  const handleIdeologyChange = (candidate, newIdeology) => {
    setCandidateIdeology(prev => ({
      ...prev,
      [candidate]: newIdeology
    }));
  };
  
  // Handle change to an ideological modifier
  const handleModifierChange = (ideologyGroup, candidate, value) => {
    setIdeologyModifiers(prev => ({
      ...prev,
      [ideologyGroup]: {
        ...prev[ideologyGroup],
        [candidate]: parseFloat(value) || 0
      }
    }));
  };

  // Calculate preference matrix based on initial votes and ideological modifiers
  const calculatePreferenceMatrix = (initialVotesData) => {
    const matrix = {};
    
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

  // State for preference matrices (who voters rank 2nd, 3rd, etc.) based on initial votes and ideology
  const [preferenceMatrix, setPreferenceMatrix] = useState(() => calculatePreferenceMatrix(initialVotes));
  
  // Update preference matrix when ideology settings change
  useEffect(() => {
    setPreferenceMatrix(calculatePreferenceMatrix(initialVotes));
  }, [initialVotes, candidateIdeology, ideologyModifiers]);

  // Set normalized votes directly from initial votes (no normalization needed)
  useEffect(() => {
    setNormalizedVotes({ ...initialVotes });
  }, [initialVotes]);

  // Auto-adjust all percentages to maintain 100% total
  const handleInitialVoteChange = (candidate, newValue) => {
    const numValue = parseFloat(newValue) || 0;
    
    setInitialVotes(prev => {
      // Calculate the difference from the previous value
      const oldValue = prev[candidate] || 0;
      const difference = numValue - oldValue;
      
      // If no change or all values are 0, just update the single value
      if (difference === 0) {
        return { ...prev, [candidate]: numValue };
      }
      
      // Get all other candidates and their current percentages
      const otherCandidates = candidates.filter(c => c !== candidate);
      const otherTotal = otherCandidates.reduce((sum, c) => sum + (prev[c] || 0), 0);
      
      // If other candidates have 0 total, we can't redistribute proportionally
      if (otherTotal === 0 && difference !== 0) {
        // Equal distribution among others
        const equalShare = -difference / otherCandidates.length;
        const result = { ...prev, [candidate]: numValue };
        otherCandidates.forEach(c => {
          result[c] = Math.max(0, (prev[c] || 0) + equalShare);
        });
        return result;
      }
      
      // Proportionally adjust other candidates to maintain 100% total
      const newPercentages = { ...prev, [candidate]: numValue };
      
      // Calculate scaling factor for remaining percentages
      const scalingFactor = (otherTotal - difference) / otherTotal;
      
      // Apply scaling to other candidates
      otherCandidates.forEach(c => {
        newPercentages[c] = Math.max(0, (prev[c] || 0) * scalingFactor);
      });
      
      // Ensure the sum is exactly 100
      const newTotal = Object.values(newPercentages).reduce((sum, value) => sum + parseFloat(value || 0), 0);
      if (Math.abs(newTotal - 100) > 0.01) {
        const adjustmentFactor = 100 / newTotal;
        for (const c in newPercentages) {
          newPercentages[c] = newPercentages[c] * adjustmentFactor;
        }
      }
      
      return newPercentages;
    });
  };

  // Handle changes to exhaustion rates
  const handleExhaustionRateChange = (candidate, value) => {
    setExhaustionRates(prev => ({
      ...prev,
      [candidate]: parseFloat(value) || 0
    }));
  };

  // Handle changes to preference distribution (as modifiers to the base preferences)
  const handlePreferenceChange = (voter, ranked, value) => {
    // Get the voter's ideology
    const voterIdeology = candidateIdeology[voter];
    
    // Update the modifier value in the ideologyModifiers object
    const newModifiers = { ...ideologyModifiers };
    newModifiers[voterIdeology][ranked] = parseFloat(value) / 100; // Convert percentage to decimal modifier
    
    // Recalculate the entire preference matrix with the new modifier
    setPreferenceMatrix(calculatePreferenceMatrix(initialVotes));
  };
  
  // Apply the ideological modifier for a specific candidate
  const applyIdeologicalModifier = (voter, ranked, modifierValue) => {
    const voterIdeology = candidateIdeology[voter];
    
    // Update the modifier value
    const newModifiers = { ...ideologyModifiers };
    newModifiers[voterIdeology][ranked] = parseFloat(modifierValue);
    
    // Recalculate the preference matrix
    setPreferenceMatrix(calculatePreferenceMatrix(initialVotes));
  };

  // Function to export results to CSV in tabular format (candidates as rows, rounds as columns)
  const exportToCSVTabular = (abridged = false) => {
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

  // Run the ranked choice voting simulation
  const runSimulation = () => {
    // Initialize votes with normalized initial percentages
    let currentRound = {};
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

    let previousRound = null;
    let previousRoundPercentages = null;
    let roundResults = [];
    let activeCandidates = [...candidates];
    let roundNumber = 1;
    let initialTotalVotes = 100; // Start with 100% of initial votes
    let currentTotalVotes = initialTotalVotes;

    // Continue until a candidate has majority or only one candidate remains
    while (activeCandidates.length > 1) {
      // Store previous round data to calculate gains
      previousRound = roundResults.length > 0 ? roundResults[roundResults.length - 1].votes : null;
      previousRoundPercentages = roundResults.length > 0 ? roundResults[roundResults.length - 1].remainingPercentages : null;
      
      // Calculate active votes total (should equal currentTotalVotes, but calculate to be sure)
      const activeVotesTotal = activeCandidates.reduce((sum, candidate) => sum + currentRound[candidate], 0);
      
      // Calculate percentages of remaining ballots
      const remainingPercentages = {};
      activeCandidates.forEach(candidate => {
        remainingPercentages[candidate] = activeVotesTotal > 0 
          ? (currentRound[candidate] / activeVotesTotal) * 100 
          : 0;
      });
      
      // Calculate gains from previous round
      const votesGained = {};
      if (previousRound) {
        candidates.forEach(candidate => {
          votesGained[candidate] = currentRound[candidate] - (previousRound[candidate] || 0);
        });
      }
      
      // Add current round to results
      roundResults.push({
        round: roundNumber,
        votes: {...currentRound},
        remainingPercentages: {...remainingPercentages},
        previousRoundPercentages,
        votesGained: {...(votesGained || {})},
        eliminated: null,
        totalVotesRemaining: currentTotalVotes,
        activeVotesTotal: activeVotesTotal
      });

      // Find candidate with lowest votes
      let lowestVotes = Infinity;
      let lowestCandidate = null;
      
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
        let winningCandidate = null;
        let highestVotes = 0;
        let highestRemaining = 0;
        
        activeCandidates.forEach(candidate => {
          if (currentRound[candidate] > highestVotes) {
            highestVotes = currentRound[candidate];
            highestRemaining = remainingPercentages[candidate];
            winningCandidate = candidate;
          }
        });
        
        setWinner({
          candidate: winningCandidate,
          votes: highestVotes,
          percentage: highestVotes, // % of initial ballots
          remainingPercentage: highestRemaining, // % of remaining ballots
          finalRound: roundNumber,
          totalInitialVotes: initialTotalVotes,
          totalRemainingVotes: currentTotalVotes
        });
        
        roundResults[roundResults.length - 1].eliminated = lowestCandidate;
        roundResults[roundResults.length - 1].isLastRound = true;
        setResults(roundResults);
        return;
      }

      // No winner yet, so eliminate lowest candidate
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
      const rawPreferences = {};
      let totalRawPreference = 0;
      
      activeCandidates.forEach(candidate => {
        rawPreferences[candidate] = preferenceMatrix[lowestCandidate][candidate];
        totalRawPreference += rawPreferences[candidate];
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

    // If we get here, only one candidate remains
    if (activeCandidates.length === 1) {
      const finalCandidate = activeCandidates[0];
      const finalVotes = currentRound[finalCandidate];
      
      // Store previous round data to calculate gains
      previousRound = roundResults.length > 0 ? roundResults[roundResults.length - 1].votes : null;
      previousRoundPercentages = roundResults.length > 0 ? roundResults[roundResults.length - 1].remainingPercentages : null;
      
      // Calculate gains from previous round
      const votesGained = {};
      if (previousRound) {
        candidates.forEach(candidate => {
          votesGained[candidate] = currentRound[candidate] - (previousRound[candidate] || 0);
        });
      }
      
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
        previousRoundPercentages,
        votesGained: {...(votesGained || {})},
        eliminated: null,
        isLastRound: true,
        totalVotesRemaining: currentTotalVotes,
        activeVotesTotal: finalVotes
      });
      
      setWinner({
        candidate: finalCandidate,
        votes: finalVotes,
        percentage: initialPercentage, // % of initial ballots
        remainingPercentage: remainingPercentage, // % of remaining ballots
        finalRound: roundNumber,
        totalInitialVotes: initialTotalVotes,
        totalRemainingVotes: currentTotalVotes
      });
    }
    
    setResults(roundResults);
  };

  return (
    <div className="mx-auto p-4 bg-gray-50 rounded-lg max-w-6xl">
      <h1 className="text-xl font-bold mb-4">NYC Mayoral Primary Ranked Choice Voting Simulator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Ballot Exhaustion Rates</h2>
          <p className="text-sm text-gray-600 mb-2">Enter the percentage of ballots that don't continue to the next choice when a candidate is eliminated.</p>
          
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
      </div>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-2">Voter Preferences</h2>
        <p className="text-sm text-gray-600 mb-2">
          Choose a candidate to edit how their voters rank other candidates.
          Percentages show how votes redistribute when a candidate is eliminated.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {candidates.map(candidate => (
            <button
              key={`pref-button-${candidate}`}
              className={`px-2 py-1 text-sm rounded ${editingPreferences === candidate ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setEditingPreferences(candidate)}
            >
              {candidate}
            </button>
          ))}
        </div>
        
        {editingPreferences && (
          <div>
            <h3 className="font-semibold mb-2">
              How <span className="text-blue-600">{editingPreferences}</span> voters rank other candidates:
            </h3>
            
            <div className="text-sm mb-3 text-gray-600">
              Rankings are automatically calculated based on initial vote percentages and ideological alignment.
              The table below shows how <span className="font-semibold">{editingPreferences}</span> voters would 
              distribute their votes when their candidate is eliminated.
            </div>
            
            <div className="grid grid-cols-1 gap-2 mb-4">
              {candidates.filter(c => c !== editingPreferences)
                .sort((a, b) => preferenceMatrix[editingPreferences][b] - preferenceMatrix[editingPreferences][a])
                .map(candidate => (
                <div key={`pref-${editingPreferences}-${candidate}`} className="flex items-center">
                  <label className="inline-block w-32 sm:w-40 text-sm">{candidate}:</label>
                  <div className="w-48 bg-gray-200 h-4 rounded overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full" 
                      style={{width: `${preferenceMatrix[editingPreferences][candidate]}%`}}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{preferenceMatrix[editingPreferences][candidate].toFixed(1)}%</span>
                </div>
              ))}
            </div>
            
            <div className="text-sm mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="font-semibold mb-1">How it works:</p>
              <p>These preferences are calculated based on:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>Initial vote percentages (popular candidates get more redistributed votes)</li>
                <li>Ideological alignment (voters prefer candidates with similar politics)</li>
              </ol>
              <p className="mt-1">Changing initial vote percentages will automatically update these preferences.</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col mb-6">
        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-semibold text-gray-700 self-center mb-2"
        >
          {showAdvancedSettings ? "Hide Advanced Settings" : "Show Advanced Settings"}
        </button>
        
        {showAdvancedSettings && (
          <div className="bg-white p-4 rounded shadow">
            <div className="flex gap-2 mb-4 border-b pb-2">
              <button 
                className={`px-3 py-1 rounded ${activeSettingsTab === 'candidates' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveSettingsTab('candidates')}
              >
                Candidate Ideology
              </button>
              <button 
                className={`px-3 py-1 rounded ${activeSettingsTab === 'modifiers' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setActiveSettingsTab('modifiers')}
              >
                Preference Modifiers
              </button>
            </div>
            
            {activeSettingsTab === 'candidates' && (
              <div>
                <h3 className="font-semibold mb-2">Candidate Ideological Groups</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Assign each candidate to an ideological group to determine how their votes redistribute.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {candidates.map(candidate => (
                    <div key={`ideology-${candidate}`} className="flex items-center">
                      <label className="inline-block w-32 sm:w-40 text-sm">{candidate}:</label>
                      <select
                        value={candidateIdeology[candidate]}
                        onChange={(e) => handleIdeologyChange(candidate, e.target.value)}
                        className="p-1 border rounded"
                      >
                        {ideologicalGroups.map(group => (
                          <option key={`${candidate}-${group}`} value={group}>
                            {group.charAt(0).toUpperCase() + group.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeSettingsTab === 'modifiers' && (
              <div>
                <h3 className="font-semibold mb-2">Preference Modifiers</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Adjust how much each ideological group prefers or dislikes candidates. 
                  Positive values increase preference, negative values decrease preference.
                </p>
                
                {ideologicalGroups.map(group => (
                  <div key={`modifiers-${group}`} className="mb-4">
                    <h4 className="font-semibold text-sm border-b mb-2 pb-1">
                      How {group.charAt(0).toUpperCase() + group.slice(1)} voters rank candidates:
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {candidates.map(candidate => (
                        <div key={`modifier-${group}-${candidate}`} className="flex items-center">
                          <label className="inline-block w-32 sm:w-40 text-sm">{candidate}:</label>
                          <input
                            type="range"
                            min="-1"
                            max="3"
                            step="0.1"
                            value={ideologyModifiers[group][candidate]}
                            onChange={(e) => handleModifierChange(group, candidate, e.target.value)}
                            className="w-24"
                          />
                          <span className="ml-2 text-sm">
                            {ideologyModifiers[group][candidate] > 0 ? '+' : ''}
                            {ideologyModifiers[group][candidate].toFixed(1)}
                          </span>
                          <div className={`ml-2 h-4 w-8 rounded ${
                            ideologyModifiers[group][candidate] > 0 
                              ? 'bg-green-500' 
                              : ideologyModifiers[group][candidate] < 0 
                                ? 'bg-red-500' 
                                : 'bg-gray-300'
                          }`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
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
              onClick={() => exportToCSVTabular(false)}
              className="bg-green-600 text-white px-3 py-2 rounded font-bold flex items-center"
              title="Export complete results with all rounds"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Export Full CSV
            </button>
            
            <button
              onClick={() => exportToCSVTabular(true)}
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
      
      {winner && (
        <div className="bg-green-100 border border-green-300 p-4 rounded shadow mb-6">
          <h2 className="font-bold text-green-800 mb-2 text-xl">Winner: {winner.candidate}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Final vote count:</p>
              <p>{winner.votes.toFixed(2)}% of initial ballots</p>
              <p>{winner.remainingPercentage.toFixed(2)}% of remaining ballots</p>
              <p>Won in round {winner.finalRound} of {results.length}</p>
            </div>
            <div>
              <p className="font-semibold">Ballot exhaustion:</p>
              <p>{(100 - winner.totalRemainingVotes).toFixed(2)}% of ballots exhausted</p>
              <p>{winner.totalRemainingVotes.toFixed(2)}% of ballots remained in final round</p>
            </div>
          </div>
        </div>
      )}
      
      {results.length > 0 && (
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
                  {round.remainingPercentages && (
                    <p className="text-xs text-gray-500">
                      {/* Debug to verify percentages add up to 100% */}
                      Remaining percentages sum: {Object.values(round.remainingPercentages)
                        .reduce((sum, value) => sum + value, 0).toFixed(2)}%
                    </p>
                  )}
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
                
                {round.eliminated && round.exhaustedVotes > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>{round.exhaustedVotes.toFixed(2)}% of ballots exhausted this round</p>
                    <p>{round.votesToRedistribute.toFixed(2)}% redistributed to other candidates</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NYCMayoralPrimarySimulator;