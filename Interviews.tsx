
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage, Modality } from '@google/genai';
import { getGenAIInstance } from './geminiService';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { decodeAudioData, createBlob } from './audioUtils';
import { decode } from './utils/base64Utils';
import { GEMINI_LIVE_MODEL } from './constants';

export const Interviews: React.FC = () => {
  const [field, setField] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Stats from screenshot
  const stats = [
    { label: 'Total Sessions', value: '15', icon: 'fa-video', color: 'text-cyan-400' },
    { label: 'Avg Score', value: '85%', icon: 'fa-star', color: 'text-cyan-400' },
    { label: 'Practice Time', value: '12 hrs', icon: 'fa-clock', color: 'text-cyan-400' },
    { label: 'Ready Topics', value: '8/12', icon: 'fa-check-circle', color: 'text-cyan-400' },
  ];

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
        setStatus('AI is speaking...');
      } catch (audioDecodeError) {
        console.error('Error decoding audio data:', audioDecodeError);
        setError('Error processing AI audio.');
      }
    }
    if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      setCurrentInputTranscription((prev) => prev + text);
      setStatus('You are speaking...');
    }
    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      setCurrentOutputTranscription((prev) => prev + text);
    }
    if (message.serverContent?.turnComplete) {
      if (currentInputTranscription.trim()) setTranscript((prev) => [...prev, `You: ${currentInputTranscription}`]);
      if (currentOutputTranscription.trim()) setTranscript((prev) => [...prev, `AI: ${currentOutputTranscription}`]);
      setCurrentInputTranscription('');
      setCurrentOutputTranscription('');
      setStatus('AI is listening...');
    }
    const interrupted = message.serverContent?.interrupted;
    if (interrupted) {
      for (const source of sourcesRef.current.values()) {
        source.stop();
        sourcesRef.current.delete(source);
      }
      nextStartTimeRef.current = 0;
      setStatus('AI is thinking...');
    }
  }, [currentInputTranscription, currentOutputTranscription]);

  const startInterviewCall = useCallback(async () => {
    if (field.trim() === '') {
      setError('Please enter a job field or topic.');
      return;
    }

    setInterviewStarted(true);
    setIsCalling(true);
    setStatus('Connecting to AI interviewer...');
    setError(null);
    setTranscript([]);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const ai = getGenAIInstance();

      sessionPromiseRef.current = ai.live.connect({
        model: GEMINI_LIVE_MODEL,
        callbacks: {
          onopen: () => {
            setStatus('Interview started. AI interviewer is ready.');
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ text: `Start the interview for a ${field} role. Ask your first question.` });
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
              setError('Connection error.');
              stopInterviewCall();
          },
          onclose: () => {
              setStatus('Interview ended.');
              stopInterviewCall();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `You are an AI interviewer specializing in ${field}. You will ask common interview questions one by one. After each user response, you will provide constructive feedback or a follow-up question. Your goal is to simulate a realistic interview experience.`,
        },
      });
      await sessionPromiseRef.current;
    } catch (err) {
      console.error(err);
      setError('Failed to start call. Check microphone.');
      stopInterviewCall();
    }
  }, [field, handleLiveOnMessage]);

  const stopInterviewCall = useCallback(() => {
    setIsCalling(false);
    // If we are in "Idle" status (meaning error or just stopped), we go back to setup
    if (!isCalling) setInterviewStarted(false);
    
    resetAudioState();
    sessionPromiseRef.current?.then((session) => session.close()).catch(e => console.error(e));
    sessionPromiseRef.current = null;
    setStatus('Idle');
  }, [resetAudioState, isCalling]);

  useEffect(() => {
    return () => { if (isCalling) stopInterviewCall(); };
  }, [isCalling, stopInterviewCall]);

  if (interviewStarted) {
      return (
        <div className="h-full flex flex-col p-4">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-white">Interview: <span className="text-cyan-400">{field}</span></h2>
                 <Button onClick={() => { setInterviewStarted(false); stopInterviewCall(); }} className="bg-red-500 hover:bg-red-600 text-white px-4 md:px-6 text-sm md:text-base">End Interview</Button>
             </div>
             
             <div className="flex-1 glass-card bg-gray-900/80 p-6 rounded-2xl border border-gray-800 overflow-y-auto custom-scrollbar mb-6">
                 {transcript.length === 0 && (
                     <div className="text-center text-gray-500 mt-20">
                         <div className="w-16 h-16 rounded-full bg-gray-800 mx-auto flex items-center justify-center mb-4 animate-pulse">
                             <i className="fas fa-microphone text-cyan-500 text-2xl"></i>
                         </div>
                         <p>{status}</p>
                     </div>
                 )}
                 <div className="space-y-4">
                     {transcript.map((line, idx) => (
                         <div key={idx} className={`flex ${line.startsWith('You:') ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[85%] p-4 rounded-xl ${line.startsWith('You:') ? 'bg-cyan-900/30 border border-cyan-500/30 text-cyan-100' : 'bg-gray-800 border border-gray-700 text-gray-300'}`}>
                                 <p className="text-xs opacity-50 mb-1 font-bold uppercase">{line.startsWith('You:') ? 'Candidate' : 'Interviewer'}</p>
                                 <p>{line.replace(/^(You:|AI:)/, '').trim()}</p>
                             </div>
                         </div>
                     ))}
                     {isCalling && (currentInputTranscription || currentOutputTranscription) && (
                         <div className="text-center text-xs text-gray-500 animate-pulse mt-4">
                             {currentInputTranscription ? 'Listening...' : 'Speaking...'}
                         </div>
                     )}
                 </div>
             </div>
        </div>
      )
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mock <span className="text-cyan-400">Interviews</span></h1>
          <p className="text-gray-400">Practice with AI-powered interview simulations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
              <div key={idx} className="glass-card bg-gray-900/60 p-4 md:p-6 rounded-2xl border border-gray-800">
                  <div className={`mb-3 text-xl md:text-2xl ${stat.color}`}>
                      <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-500 text-[10px] md:text-xs uppercase tracking-wide">{stat.label}</p>
              </div>
          ))}
      </div>

      <div className="glass-card bg-gray-900/50 border border-gray-800 p-8 rounded-2xl flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-cyan-900/30 flex items-center justify-center mb-6 text-cyan-400 text-4xl shadow-lg shadow-cyan-500/10">
              <i className="fas fa-user-tie"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Start New Session</h2>
          <p className="text-gray-400 text-center mb-8 max-w-md">Enter the job title, topic, or field you want to practice for. The AI will adapt its questions accordingly.</p>
          
          <div className="w-full max-w-md space-y-4">
              <Input
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g. Senior React Developer, Marketing Manager"
                className="w-full bg-gray-950 border-gray-700 text-white p-4 text-lg rounded-xl focus:ring-cyan-500"
                onKeyPress={(e) => e.key === 'Enter' && startInterviewCall()}
              />
              <Button 
                onClick={startInterviewCall} 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 text-lg rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02]"
              >
                  {isCalling ? <LoadingSpinner /> : 'Start Interview'}
              </Button>
              {error && <p className="text-red-500 text-center text-sm mt-2">{error}</p>}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 w-full max-w-3xl">
               <div className="flex items-center gap-2 justify-center"><i className="fas fa-check text-green-500"></i> Real-time Feedback</div>
               <div className="flex items-center gap-2 justify-center"><i className="fas fa-check text-green-500"></i> Multi-language</div>
               <div className="flex items-center gap-2 justify-center"><i className="fas fa-check text-green-500"></i> Voice Interaction</div>
          </div>
      </div>
    </div>
  );
};
