
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';

export const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-4">Settings</h2>
      
      <div className="max-w-2xl">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">API Configuration</h3>
          <p className="text-gray-600 mb-4">
            Enter your Google Gemini API Key here. This key will be stored locally in your browser and used for all AI interactions.
            If left empty, the application will attempt to use the default system key.
          </p>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiKey">
              Gemini API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              {saved ? 'Saved!' : 'Save Key'}
            </Button>
            {saved && <span className="text-green-600 font-medium animate-pulse">Settings saved successfully.</span>}
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            Don't have a key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">Get one from Google AI Studio</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
