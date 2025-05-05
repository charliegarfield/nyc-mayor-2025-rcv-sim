import React from 'react';
import { Candidate, CandidateIdeology, IdeologyModifiers, IdeologyType } from '../../types';

interface AdvancedSettingsProps {
  showAdvancedSettings: boolean;
  setShowAdvancedSettings: (show: boolean) => void;
  activeSettingsTab: string;
  setActiveSettingsTab: (tab: string) => void;
  candidates: Candidate[];
  candidateIdeology: CandidateIdeology;
  handleIdeologyChange: (candidate: Candidate, newIdeology: string) => void;
  ideologicalGroups: string[];
  ideologyModifiers: IdeologyModifiers;
  handleModifierChange: (ideologyGroup: string, candidate: Candidate, value: string) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  showAdvancedSettings,
  setShowAdvancedSettings,
  activeSettingsTab,
  setActiveSettingsTab,
  candidates,
  candidateIdeology,
  handleIdeologyChange,
  ideologicalGroups,
  ideologyModifiers,
  handleModifierChange
}) => {
  return (
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
                          value={ideologyModifiers[group as IdeologyType][candidate]}
                          onChange={(e) => handleModifierChange(group, candidate, e.target.value)}
                          className="w-24"
                        />
                        <span className="ml-2 text-sm">
                          {ideologyModifiers[group as IdeologyType][candidate] > 0 ? '+' : ''}
                          {ideologyModifiers[group as IdeologyType][candidate].toFixed(1)}
                        </span>
                        <div className={`ml-2 h-4 w-8 rounded ${
                          ideologyModifiers[group as IdeologyType][candidate] > 0 
                            ? 'bg-green-500' 
                            : ideologyModifiers[group as IdeologyType][candidate] < 0 
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
  );
};

export default AdvancedSettings;