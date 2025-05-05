import React, { useState, useEffect, useMemo } from 'react';
import { 
  Candidate, 
  VotePercentages, 
  CandidateIdeology, 
  IdeologyModifiers, 
  PreferenceMatrix, 
  RoundResult,
  Winner,
  IdeologyType
} from '../../types';
import { calculatePreferenceMatrix, runRCVSimulation } from '../../utils/simulation';
import InitialVotes from './InitialVotes';
import ExhaustionRates from './ExhaustionRates';
import VoterPreferences from './VoterPreferences';
import AdvancedSettings from './AdvancedSettings';
import SimulationControls from './SimulationControls';
import WinnerDisplay from './WinnerDisplay';
import RoundResults from './RoundResults';

const NYCRCVSimulator: React.FC = () => {
  // Use useMemo to avoid recreating the array on each render
  const candidates = useMemo<Candidate[]>(() => [
    "Andrew Cuomo",
    "Brad Lander",
    "Adrienne Adams",
    "Jessica Ramos",
    "Zellnor Myrie",
    "Zohran Mamdani",
    "Scott Stringer",
    "Michael Blake",
    "Whitney Tilson"
  ], []);

  // State for initial vote percentages based on recent polling data
  const [initialVotes, setInitialVotes] = useState<VotePercentages>({
    "Andrew Cuomo": 48.54,
    "Zohran Mamdani": 20.51,
    "Brad Lander": 8.92,
    "Scott Stringer": 6.37,
    "Adrienne Adams": 6.24,
    "Jessica Ramos": 4.20,
    "Zellnor Myrie": 3.82,
    "Michael Blake": 0.89,
    "Whitney Tilson": 0.51 
  });

  // Normalize the initial votes when component mounts to ensure they add up to 100%
  useEffect(() => {
    // Calculate the total of initial votes
    const totalInitialVotes = Object.values(initialVotes).reduce((sum, value) => sum + parseFloat(value.toString() || '0'), 0);
    
    // If not 100%, normalize them
    if (Math.abs(totalInitialVotes - 100) > 0.01) {
      const normalizedInitial: VotePercentages = {};
      for (const candidate in initialVotes) {
        normalizedInitial[candidate] = (parseFloat(initialVotes[candidate].toString() || '0') / totalInitialVotes) * 100;
      }
      setInitialVotes(normalizedInitial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State for ballot exhaustion rates based on candidate profiles
  const [exhaustionRates, setExhaustionRates] = useState<VotePercentages>({
    "Andrew Cuomo": 22, 
    "Brad Lander": 12,
    "Adrienne Adams": 18,
    "Jessica Ramos": 15,
    "Zellnor Myrie": 17,
    "Zohran Mamdani": 30,
    "Scott Stringer": 16,
    "Michael Blake": 20,
    "Whitney Tilson": 22
  });

  // Normalized initial votes
  const [normalizedVotes, setNormalizedVotes] = useState<VotePercentages>({});

  // State for simulation results
  const [results, setResults] = useState<RoundResult[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);

  // Current candidate being edited in preferences
  const [editingPreferences, setEditingPreferences] = useState<string | null>(null);
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('candidates');
  
  // Make ideological groups editable
  const [candidateIdeology, setCandidateIdeology] = useState<CandidateIdeology>({
    "Zohran Mamdani": "progressive", 
    "Jessica Ramos": "progressive",
    "Zellnor Myrie": "progressive",
    "Brad Lander": "progressive",
    "Scott Stringer": "moderate",
    "Adrienne Adams": "progressive",
    "Michael Blake": "moderate",
    "Whitney Tilson": "moderate",
    "Andrew Cuomo": "conservative"
  });
  
  // Make modifier values editable
  const [ideologyModifiers, setIdeologyModifiers] = useState<IdeologyModifiers>({
    // Progressive candidates
    "progressive": {
      "Zohran Mamdani": .3, // Mamdani does weirdly poorly among progressive RCVs?
      "Jessica Ramos": 1,
      "Zellnor Myrie": 0.8,
      "Brad Lander": 1,
      "Scott Stringer": 0.3,
      "Adrienne Adams": -0.2,
      "Michael Blake": -0.3,
      "Whitney Tilson": -0.6,
      "Andrew Cuomo": -0.9
    },
    // Moderate candidates
    "moderate": {
      "Andrew Cuomo": -0.7, // RCVers, except Adams, hate Cuomo?
      "Adrienne Adams": 0.7,
      "Scott Stringer": 0.4,
      "Michael Blake": 0.4,
      "Whitney Tilson": 0.3,
      "Brad Lander": 0.5,
      "Zellnor Myrie": -0.3,
      "Jessica Ramos": -0.5,
      "Zohran Mamdani": -0.8
    },
    // Conservative/pro-business candidates
    "conservative": {
      "Whitney Tilson": 0.8,
      "Andrew Cuomo": 0.3,
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
  const ideologicalGroups = useMemo(() => ["progressive", "moderate", "conservative"], []);
  
  // Handle change to a candidate's ideological group
  const handleIdeologyChange = (candidate: Candidate, newIdeology: string) => {
    setCandidateIdeology(prev => ({
      ...prev,
      [candidate]: newIdeology as IdeologyType
    }));
  };
  
  // Handle change to an ideological modifier
  const handleModifierChange = (ideologyGroup: string, candidate: Candidate, value: string) => {
    setIdeologyModifiers(prev => ({
      ...prev,
      [ideologyGroup as IdeologyType]: {
        ...prev[ideologyGroup as IdeologyType],
        [candidate]: parseFloat(value) || 0
      }
    }));
  };
  
  // State for preference matrices (who voters rank 2nd, 3rd, etc.) based on initial votes and ideology
  const [preferenceMatrix, setPreferenceMatrix] = useState<PreferenceMatrix>(() => 
    calculatePreferenceMatrix(candidates, initialVotes, candidateIdeology, ideologyModifiers)
  );
  
  // Update preference matrix when ideology settings change
  useEffect(() => {
    setPreferenceMatrix(calculatePreferenceMatrix(candidates, initialVotes, candidateIdeology, ideologyModifiers));
  }, [initialVotes, candidateIdeology, ideologyModifiers, candidates]);

  // Set normalized votes directly from initial votes (no normalization needed)
  useEffect(() => {
    setNormalizedVotes({ ...initialVotes });
  }, [initialVotes]);

  // Auto-adjust all percentages to maintain 100% total
  const handleInitialVoteChange = (candidate: Candidate, newValue: string) => {
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
      const newTotal = Object.values(newPercentages).reduce((sum, value) => sum + parseFloat(value.toString() || '0'), 0);
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
  const handleExhaustionRateChange = (candidate: Candidate, value: string) => {
    setExhaustionRates(prev => ({
      ...prev,
      [candidate]: parseFloat(value) || 0
    }));
  };

  // Run the ranked choice voting simulation
  const runSimulation = () => {
    const { results: simulationResults, winner: simulationWinner } = runRCVSimulation(
      candidates, 
      normalizedVotes, 
      exhaustionRates, 
      preferenceMatrix
    );
    
    setResults(simulationResults);
    setWinner(simulationWinner);
  };

  return (
    <div className="mx-auto p-4 bg-gray-50 rounded-lg max-w-6xl">
      <h1 className="text-xl font-bold mb-4">NYC Mayoral Primary Ranked Choice Voting Simulator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <InitialVotes 
          candidates={candidates} 
          initialVotes={initialVotes} 
          handleInitialVoteChange={handleInitialVoteChange} 
        />
        
        <ExhaustionRates 
          candidates={candidates} 
          exhaustionRates={exhaustionRates} 
          handleExhaustionRateChange={handleExhaustionRateChange} 
        />
      </div>
      
      <VoterPreferences 
        candidates={candidates} 
        editingPreferences={editingPreferences} 
        setEditingPreferences={setEditingPreferences} 
        preferenceMatrix={preferenceMatrix} 
      />
      
      <AdvancedSettings 
        showAdvancedSettings={showAdvancedSettings}
        setShowAdvancedSettings={setShowAdvancedSettings}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        candidates={candidates}
        candidateIdeology={candidateIdeology}
        handleIdeologyChange={handleIdeologyChange}
        ideologicalGroups={ideologicalGroups}
        ideologyModifiers={ideologyModifiers}
        handleModifierChange={handleModifierChange}
      />
      
      <SimulationControls 
        runSimulation={runSimulation} 
        results={results} 
        candidates={candidates} 
      />
      
      <WinnerDisplay winner={winner} />
      
      <RoundResults results={results} candidates={candidates} />
    </div>
  );
};

export default NYCRCVSimulator;