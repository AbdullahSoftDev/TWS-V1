
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage, Modality } from '@google/genai';
import { GeminiService, getGenAIInstance } from './geminiService';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { decodeAudioData, createBlob } from './audioUtils';
import { decode } from './utils/base64Utils';
import { GEMINI_LIVE_MODEL, CODING_HELPER_SYSTEM_INSTRUCTION } from './constants';

export const CodingHelper: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [currentAiResponse, setCurrentAiResponse] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const geminiService = useRef(new GeminiService());
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSentCodeRef = useRef<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAiResponse]);

  const resetAudioState = useCallback(() => {
    for (const source of sourcesRef.current.values()) {
      source.stop();
      sourcesRef.current.delete(source);
    }
    nextStartTimeRef.current = 0;
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
  }, []);

  const handleLiveOnMessage = useCallback(async (message: LiveServerMessage) => {
    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64EncodedAudioString) {
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      nextStartTimeRef.current = Math.max(
        nextStartTimeRef.current,
        outputAudioContextRef.current.currentTime,
      );
      try {
        const audioBuffer = await decodeAudioData(
          decode(base64EncodedAudioString),
          outputAudioContextRef.current,
          24000,
          1,
        );
        const source = outputAudioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContextRef.current.destination);
        source.addEventListener('ended', () => {
          sourcesRef.current.delete(source);
        });
        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
        sourcesRef.current.add(source);
      } catch (audioDecodeError) {
        console.error('Error decoding audio data:', audioDecodeError);
      }
    }

    const transcription = message.serverContent?.outputTranscription?.text;
    if (transcription) {
      setCurrentAiResponse(prev => prev + transcription);
    }

    if (message.serverContent?.turnComplete) {
      setCurrentAiResponse(prev => {
        if (prev.trim()) {
          setMessages(curr => [...curr, { role: 'ai', text: prev.trim() }]);
        }
        return '';
      });
    }
  }, []);

  const startLiveSession = useCallback(async () => {
    setConnectionStatus('Connecting...');
    setError(null);

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const ai = getGenAIInstance();

      const goalContext = `User Goal: Create a program in ${language} that: ${goal}.`;
      const fullSystemInstruction = `${CODING_HELPER_SYSTEM_INSTRUCTION}\n${goalContext}`;

      sessionPromiseRef.current = ai.live.connect({
        model: GEMINI_LIVE_MODEL,
        callbacks: {
          onopen: () => {
            setConnectionStatus('Connected (Mic ON)');
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ text: "Session started. I am ready to code." });
            });
            
            const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current!.destination);
          },
          onmessage: handleLiveOnMessage,
          onerror: (e) => {
            console.error(e);
            setConnectionStatus('Error');
            setError('Connection error.');
          },
          onclose: () => {
            setConnectionStatus('Disconnected');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }, 
          },
          systemInstruction: fullSystemInstruction,
        },
      });

      await sessionPromiseRef.current;
    } catch (e) {
      console.error(e);
      setConnectionStatus('Failed to connect');
      setError('Could not access microphone or connect to AI.');
      stopLiveSession();
    }
  }, [goal, language, handleLiveOnMessage, resetAudioState]);

  const stopLiveSession = useCallback(() => {
    resetAudioState();
    sessionPromiseRef.current?.then(s => s.close()).catch(e => console.error(e));
    sessionPromiseRef.current = null;
    setConnectionStatus('Disconnected');
  }, [resetAudioState]);

  useEffect(() => {
    if (!isStarted || connectionStatus !== 'Connected (Mic ON)') return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
        if (code !== lastSentCodeRef.current && code.trim().length > 0) {
            sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({ text: `[SYSTEM] User paused. Current Code:\n${code}` });
            });
            lastSentCodeRef.current = code;
        }
    }, 5000);

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [code, isStarted, connectionStatus]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Compiling and running...');
    try {
      const result = await geminiService.current.runCodeSimulation(code, language);
      setOutput(result);
      
      sessionPromiseRef.current?.then(session => {
          session.sendRealtimeInput({ text: `[SYSTEM] User ran code. Output:\n${result}` });
      });

    } catch (e) {
      const errText = `Error: ${e instanceof Error ? e.message : String(e)}`;
      setOutput(errText);
      sessionPromiseRef.current?.then(session => {
        session.sendRealtimeInput({ text: `[SYSTEM] User ran code and got ERROR:\n${errText}` });
    });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
      return () => {
          stopLiveSession();
      }
  }, [stopLiveSession]);

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">Universal Coding Helper</h2>
        <div className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programming Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Python">Python</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="C">C</option>
              <option value="C#">C#</option>
              <option value="HTML/CSS">HTML/CSS</option>
              <option value="SQL">SQL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What program do you want to make?</label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., A calculator, A snake game, Sort an array"
              className="w-full"
            />
          </div>
          <Button onClick={() => { setIsStarted(true); startLiveSession(); }} className="w-full py-3 bg-green-600 hover:bg-green-700 text-lg">
            Start Coding (Mic ON)
          </Button>
          <p className="text-sm text-gray-500 text-center mt-4">
            Microphone will be ON. You can ask for help in Urdu, Hindi, or Punjabi. 
            AI will only speak if you ask or if you are stuck.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="bg-blue-800 text-white p-4 flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-xl font-bold">Coding Helper: {language}</h2>
            <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${connectionStatus.includes('Connected') ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                <p className="text-xs opacity-80">{connectionStatus}</p>
            </div>
        </div>
        <Button onClick={() => { setIsStarted(false); stopLiveSession(); }} className="bg-red-500 hover:bg-red-600 text-sm py-1 px-3">
            End Session
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col p-4">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <h3 className="font-semibold text-gray-700">Live AI Assistant</h3>
                {connectionStatus.includes('Connected') && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200">Listening...</span>
                )}
            </div>
            
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg text-sm text-blue-900 shadow-sm">
                <strong>System:</strong> I'm listening. I'll stay silent unless you ask for help or get stuck.
            </div>
            {messages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-lg text-sm shadow-sm ${msg.role === 'ai' ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-white border'}`}>
                    <strong className="block text-xs opacity-70 mb-1">{msg.role === 'ai' ? 'AI Voice' : 'You'}</strong>
                    {msg.text}
                </div>
            ))}
            {currentAiResponse && (
                <div className="p-3 rounded-lg text-sm shadow-sm bg-purple-100 text-purple-900 border border-purple-200 animate-pulse">
                    <strong className="block text-xs opacity-70 mb-1">AI Voice (Speaking...)</strong>
                    {currentAiResponse}
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200 shrink-0">{error}</div>}
        </div>

        <div className="w-2/3 flex flex-col bg-gray-900 text-white">
          <div className="flex-1 p-1 relative">
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Start writing your ${language} code here...`}
                className="w-full h-full bg-gray-900 text-green-400 font-mono p-4 focus:outline-none resize-none"
                spellCheck="false"
            />
          </div>
          
          <div className="h-1/3 border-t border-gray-700 flex flex-col shrink-0">
            <div className="bg-gray-800 p-2 flex justify-between items-center">
                <span className="text-sm font-semibold">Terminal / Output</span>
                <Button onClick={handleRunCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700 py-1 px-4 text-sm">
                    {isRunning ? 'Running...' : 'Run Code'}
                </Button>
            </div>
            <div className="flex-1 bg-black p-4 font-mono text-sm overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                    {output || "> Ready to compile and run..."}
                </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
