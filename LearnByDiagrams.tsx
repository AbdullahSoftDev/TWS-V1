
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateText, generateImage, generateAudio } from './geminiService';
import { DiagramStep, ApiKeyError } from './types';
import MarkdownRenderer from './MarkdownRenderer';
import { decodeAudioData } from './audioUtils';
import { decode } from './utils/base64Utils';
import { AUDIO_OUTPUT_SAMPLE_RATE, GEMINI_PRO_MODEL } from './constants';
import { LoadingSpinner } from './LoadingSpinner';

interface LearnByDiagramsProps {
  onSaveNote: (title: string, content: string) => void;
}

const LearnByDiagrams: React.FC<LearnByDiagramsProps> = ({ onSaveNote }) => {
  const [topic, setTopic] = useState<string>('');
  const [steps, setSteps] = useState<DiagramStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    audioContextRef.current = new AudioContext({ sampleRate: AUDIO_OUTPUT_SAMPLE_RATE });
    return () => {
      currentAudioSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) {
      console.error("AudioContext not initialized.");
      return;
    }
    currentAudioSourceRef.current?.stop();

    try {
      const audioData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(
        audioData,
        audioContextRef.current,
        AUDIO_OUTPUT_SAMPLE_RATE,
        1
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      currentAudioSourceRef.current = source;
    } catch (e) {
      console.error("Error playing audio:", e);
      setError("Failed to play audio explanation.");
    }
  }, []);

  const handleGenerateContent = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSteps([]);
    setCurrentStepIndex(0);
    currentAudioSourceRef.current?.stop();

    try {
      const initialPrompt = `Explain "${topic}" step-by-step. For each step, provide a concise explanation (1-2 paragraphs) and then a very brief, descriptive phrase for a visual diagram. Format as:
      ## Step X: [Step Title]
      [Explanation text for step X]
      Diagram description: [Short phrase for diagram]
      
      Provide at least 3 to 5 steps for a comprehensive understanding. Focus on the core concepts for each step.`;

      const { text: rawText } = await generateText(initialPrompt, GEMINI_PRO_MODEL);

      if (!rawText) {
        throw new Error('No explanation generated.');
      }

      const parsedSteps: DiagramStep[] = [];
      const stepRegex = /##\s*Step\s*\d+:\s*([^\n]+)\n([\s\S]*?)(?=Diagram description:|\n##\s*Step|$)/g;
      let match;
      let tempRawText = rawText; 

      while ((match = stepRegex.exec(tempRawText)) !== null) {
        const stepTitle = match[1].trim();
        let explanationText = match[2].trim();
        let diagramDescription = '';

        const diagramMatch = explanationText.match(/Diagram description:\s*([^\n]+)/);
        if (diagramMatch) {
          diagramDescription = diagramMatch[1].trim();
          explanationText = explanationText.replace(/Diagram description:\s*([^\n]+)/, '').trim();
        }

        parsedSteps.push({
          text: `## ${stepTitle}\n${explanationText}`,
          imageUrl: '',
          audioBase64: '', 
        });
      }

      if (parsedSteps.length === 0 && rawText) {
        parsedSteps.push({
          text: rawText,
          imageUrl: '',
          audioBase64: '',
        });
      }

      const enhancedStepsPromises = parsedSteps.map(async (step) => {
        let diagramDescription = '';
        const diagramMatch = step.text.match(/Diagram description:\s*([^\n]+)/);
        if (diagramMatch) {
          diagramDescription = diagramMatch[1].trim();
        } else {
            diagramDescription = `A diagram illustrating the concept: ${step.text.split('\n')[0].replace('## ', '')}`;
        }
        
        const imagePrompt = `Detailed diagram illustrating: ${diagramDescription}. In a clear and educational style suitable for explaining "${topic}".`;
        const audioPrompt = step.text.replace(/##\s*Step\s*\d+:\s*([^\n]+)\n/, '').replace(/Diagram description:\s*([^\n]+)/, '').trim();

        const [imageUrl, audioBase64] = await Promise.all([
          // Updated: Removed imageSize as it is not supported
          generateImage(imagePrompt, { aspectRatio: "16:9" }),
          generateAudio(audioPrompt),
        ]);
        return { ...step, imageUrl, audioBase64 };
      });

      const finalSteps = await Promise.all(enhancedStepsPromises);
      setSteps(finalSteps);
      if (finalSteps.length > 0 && finalSteps[0].audioBase64) {
        playAudio(finalSteps[0].audioBase64);
      }

    } catch (e: any) {
      console.error('Error generating diagrams content:', e);
      if (e instanceof ApiKeyError) {
        setError(`${e.message}`);
      } else {
        setError(e.message || 'Failed to generate content. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [topic, playAudio]);


  const handleNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep.audioBase64) {
        playAudio(nextStep.audioBase64);
      }
    } else {
      alert('You have reached the end of this learning module!');
    }
  }, [currentStepIndex, steps, playAudio]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep.audioBase64) {
        playAudio(prevStep.audioBase64);
      }
    }
  }, [currentStepIndex, steps, playAudio]);

  const handleSaveNote = useCallback(() => {
    const currentStep = steps[currentStepIndex];
    if (currentStep) {
      const titleMatch = currentStep.text.match(/##\s*Step\s*\d+:\s*([^\n]+)/);
      const noteTitle = titleMatch ? `Diagram: ${topic} - ${titleMatch[1].trim()}` : `Diagram: ${topic} - Step ${currentStepIndex + 1}`;
      onSaveNote(noteTitle, currentStep.text);
      alert('Step saved to notes!');
    }
  }, [steps, currentStepIndex, topic, onSaveNote]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Learn by Diagrams</h2>

      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
          placeholder="Enter topic (e.g., 'Binary Search Tree', 'Quicksort Algorithm')"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateContent}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {steps.length > 0 && currentStep && (
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">{`Step ${currentStepIndex + 1} of ${steps.length}`}</h3>
            {currentStep.imageUrl && (
              <img
                src={currentStep.imageUrl}
                alt={`Diagram for ${topic} step ${currentStepIndex + 1}`}
                className="w-full h-auto rounded-lg shadow-md mb-6 object-cover max-h-96"
              />
            )}
            <div className="text-lg text-gray-800 leading-relaxed mb-4">
              <MarkdownRenderer content={currentStep.text.replace(/##.*\n/, '')} />
            </div>
            {currentStep.audioBase64 && (
                <button
                    onClick={() => playAudio(currentStep.audioBase64!)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-200"
                >
                    <span>Replay Audio</span>
                </button>
            )}
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="flex justify-between items-center mt-auto p-4 border-t border-gray-200">
          <button
            onClick={handlePrevStep}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            disabled={currentStepIndex === 0}
          >
            Previous
          </button>
          <button
            onClick={handleSaveNote}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full shadow-md transition-all duration-200 text-lg font-medium flex items-center space-x-2"
          >
            <span>Save Note</span>
          </button>
          <button
            onClick={handleNextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            disabled={currentStepIndex === steps.length - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
export default LearnByDiagrams;
