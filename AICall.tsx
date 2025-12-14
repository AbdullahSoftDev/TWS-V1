
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LiveServerMessage, Modality } from '@google/genai';
import { getGenAIInstance } from './geminiService';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { AI_CALL_GREETINGS, AI_CALL_SYSTEM_INSTRUCTION, GEMINI_LIVE_MODEL } from './constants';
import { decodeAudioData, createBlob } from './audioUtils';
import { decode } from './utils/base64Utils';

export const AICall: React.FC = () => {
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
        setError('Error processing AI audio.');
      }
    }

    if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      setCurrentInputTranscription((prev) => prev + text);
    }
    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      setCurrentOutputTranscription((prev) => prev + text);
    }

    if (message.serverContent?.turnComplete) {
      if (currentInputTranscription.trim()) {
        setTranscript((prev) => [...prev, `You: ${currentInputTranscription}`]);
      }
      if (currentOutputTranscription.trim()) {
        setTranscript((prev) => [...prev, `AI: ${currentOutputTranscription}`]);
      }
      setCurrentInputTranscription('');
      setCurrentOutputTranscription('');
    }

    const interrupted = message.serverContent?.interrupted;
    if (interrupted) {
      for (const source of sourcesRef.current.values()) {
        source.stop();
        sourcesRef.current.delete(source);
      }
      nextStartTimeRef.current = 0;
      setStatus('Interrupted, AI is thinking...');
    }

  }, [currentInputTranscription, currentOutputTranscription]);

  const startCall = useCallback(async () => {
    setIsCalling(true);
    setStatus('Connecting to AI...');
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
            setStatus('Call started. AI is listening...');
            const randomGreeting = AI_CALL_GREETINGS[Math.floor(Math.random() * AI_CALL_GREETINGS.length)];
            sessionPromiseRef.current?.then((session) => {
              session.sendRealtimeInput({ text: randomGreeting });
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
          onerror: (e: ErrorEvent) => {
            console.error('Live API Error:', e);
            setError('Connection error with AI. Please try again.');
            stopCall();
          },
          onclose: (e: CloseEvent) => {
            console.log('Live API connection closed:', e);
            setStatus('Call ended.');
            stopCall();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: AI_CALL_SYSTEM_INSTRUCTION,
        },
      });
      await sessionPromiseRef.current;

    } catch (err) {
      console.error('Failed to start AI Call:', err);
      setError(`Failed to start call: ${err instanceof Error ? err.message : String(err)}. Ensure microphone access is granted.`);
      stopCall();
    }
  }, [handleLiveOnMessage, resetAudioState]);

  const stopCall = useCallback(() => {
    setIsCalling(false);
    setStatus('Idle');
    setError(null);
    resetAudioState();
    sessionPromiseRef.current?.then((session) => {
      session.close();
    }).catch(e => console.error("Error closing session:", e));
    sessionPromiseRef.current = null;
  }, [resetAudioState]);

  useEffect(() => {
    return () => {
      if (isCalling) {
        stopCall();
      }
    };
  }, [isCalling, stopCall]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-4">AI Call</h2>

      <div className="flex-1 overflow-y-auto pr-4 mb-6 custom-scrollbar text-gray-700">
        <p className="text-center text-lg mb-4 font-medium">Status: <span className="text-blue-600">{status}</span></p>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        {transcript.length === 0 && !isCalling && (
          <p className="text-gray-500 text-center mt-10">Press "Start Call" to begin a live conversation with AI.</p>
        )}
        <div className="space-y-3">
          {transcript.map((line, index) => (
            <p key={index} className={line.startsWith('You:') ? 'text-right text-gray-800' : 'text-left text-gray-600'}>
              {line}
            </p>
          ))}
          {isCalling && currentInputTranscription && (
            <p className="text-right italic text-gray-500">You (speaking): {currentInputTranscription}</p>
          )}
          {isCalling && currentOutputTranscription && (
            <p className="text-left italic text-gray-400">AI (speaking): {currentOutputTranscription}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-auto">
        {!isCalling ? (
          <Button
            onClick={startCall}
            className="px-8 py-4 bg-green-600 text-white text-xl rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 flex items-center justify-center"
            disabled={status !== 'Idle' && status !== 'Call ended.' && status !== 'Connection error with AI. Please try again.'}
          >
            📞 Start Call
          </Button>
        ) : (
          <Button
            onClick={stopCall}
            className="px-8 py-4 bg-red-600 text-white text-xl rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-300 flex items-center justify-center"
          >
            {status.includes('Connecting') ? <LoadingSpinner size="md" /> : '🛑 End Call'}
          </Button>
        )}
      </div>
    </div>
  );
};
