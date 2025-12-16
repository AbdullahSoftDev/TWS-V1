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
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">Gemini API Configuration</h3>
          <p className="text-gray-600 mb-4">
            Enter your Google Gemini API Key here. This key will be stored locally in your browser.
          </p>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Gemini API Key
            </label>
            <Input
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
            {saved && <span className="text-green-600 font-medium">Settings saved successfully.</span>}
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            Get API key from: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google AI Studio</a>
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Firebase Project:</span>
              <span className="font-medium">{import.meta.env.VITE_FIREBASE_PROJECT_ID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supabase Project:</span>
              <span className="font-medium">gaoltnrwipjnvysafyld</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email.js Service:</span>
              <span className="font-medium">{import.meta.env.VITE_EMAILJS_SERVICE_ID}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};