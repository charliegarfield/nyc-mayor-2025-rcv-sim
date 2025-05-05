import React from 'react';
import { Candidate, PreferenceMatrix } from '../../types';

interface VoterPreferencesProps {
  candidates: Candidate[];
  editingPreferences: string | null;
  setEditingPreferences: (candidate: string | null) => void;
  preferenceMatrix: PreferenceMatrix;
}

const VoterPreferences: React.FC<VoterPreferencesProps> = ({ 
  candidates, 
  editingPreferences, 
  setEditingPreferences, 
  preferenceMatrix 
}) => {
  return (
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
  );
};

export default VoterPreferences;