
import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { generateText } from './geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const Quiz: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Stats from Screenshot
  const stats = [
      { label: 'Quizzes Taken', value: '12', icon: 'fa-brain', color: 'text-cyan-400' },
      { label: 'Average Score', value: '85%', icon: 'fa-trophy', color: 'text-yellow-400' },
      { label: 'XP Earned', value: '600', icon: 'fa-bolt', color: 'text-orange-400' }
  ];

  const presetQuizzes = [
      { title: 'Arrays Basics', topic: 'Data Structures', difficulty: 'Easy', time: '10 min', q: 10, score: '80%' },
      { title: 'Linked Lists', topic: 'Data Structures', difficulty: 'Medium', time: '15 min', q: 15, score: '90%' },
      { title: 'Binary Trees', topic: 'Data Structures', difficulty: 'Medium', time: '12 min', q: 12, score: null },
      { title: 'Graph Algorithms', topic: 'Algorithms', difficulty: 'Hard', time: '20 min', q: 20, score: null },
  ];

  const generateQuiz = async (customTopic?: string) => {
    const searchTopic = customTopic || topic;
    if (!searchTopic.trim()) return;
    setLoading(true);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setIsCorrect(null);

    try {
      const prompt = `Create a multiple choice question about "${searchTopic}". 
      Return JSON with this schema: { "question": string, "options": string[], "correctIndex": number (0-3), "explanation": string }. 
      Ensure valid JSON.`;
      
      const { text } = await generateText(prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      
      const data: QuizQuestion = JSON.parse(jsonString);
      setCurrentQuestion(data);
    } catch (e) {
      console.error(e);
      alert("Failed to generate quiz. Try a simpler topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(index);
    setIsCorrect(index === currentQuestion.correctIndex);
  };

  if (currentQuestion) {
      return (
        <div className="h-full flex flex-col p-4 max-w-3xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                 <button onClick={() => setCurrentQuestion(null)} className="text-gray-400 hover:text-white flex items-center gap-2">
                     <i className="fas fa-arrow-left"></i> Back to Quizzes
                 </button>
                 <span className="text-cyan-400 font-bold uppercase tracking-wider text-sm">{topic}</span>
             </div>

             <div className="glass-card bg-gray-900/90 border border-gray-800 p-8 rounded-2xl flex-1 flex flex-col">
                  <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">{currentQuestion.question}</h2>
                  
                  <div className="grid gap-4 mb-8">
                      {currentQuestion.options.map((opt, idx) => {
                          let btnClass = "w-full p-5 text-left border rounded-xl transition-all text-lg flex items-center gap-4 bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800";
                          if (selectedOption !== null) {
                              if (idx === currentQuestion.correctIndex) btnClass = "w-full p-5 text-left border rounded-xl bg-green-900/30 border-green-500 text-green-200";
                              else if (idx === selectedOption) btnClass = "w-full p-5 text-left border rounded-xl bg-red-900/30 border-red-500 text-red-200";
                              else btnClass = "w-full p-5 text-left border rounded-xl bg-gray-800/30 border-gray-800 text-gray-500 opacity-50";
                          }
                          return (
                              <button key={idx} onClick={() => handleOptionClick(idx)} disabled={selectedOption !== null} className={btnClass}>
                                  <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-sm font-bold opacity-70">{String.fromCharCode(65 + idx)}</span>
                                  {opt}
                              </button>
                          );
                      })}
                  </div>

                  {selectedOption !== null && (
                      <div className={`p-6 rounded-xl border-l-4 mb-6 ${isCorrect ? 'bg-green-900/20 border-green-500' : 'bg-cyan-900/20 border-cyan-500'} animate-fade-in`}>
                          <h4 className={`font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-cyan-400'}`}>
                              {isCorrect ? "Correct! 🎉" : "Explanation"}
                          </h4>
                          <p className="text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
                      </div>
                  )}

                  <div className="mt-auto flex justify-end">
                      <Button onClick={() => generateQuiz()} className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-semibold">
                          Next Question <i className="fas fa-arrow-right ml-2"></i>
                      </Button>
                  </div>
             </div>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2"><span className="text-cyan-400">Quizzes</span></h1>
          <p className="text-gray-400">Test your knowledge and earn XP</p>
      </div>

      <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
             <i className="fas fa-search absolute left-4 top-3.5 text-gray-500"></i>
             <Input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Generate quiz on any topic..."
                className="w-full pl-10 bg-gray-900 border-gray-800 text-white rounded-xl py-3 focus:ring-cyan-500 focus:border-cyan-500"
                onKeyPress={(e) => e.key === 'Enter' && generateQuiz()}
             />
          </div>
          <Button onClick={() => generateQuiz()} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 rounded-xl font-bold flex items-center gap-2">
              {loading ? <LoadingSpinner size="sm" /> : <><i className="fas fa-bolt"></i> Generate</>}
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, idx) => (
              <div key={idx} className="glass-card bg-gray-900/60 p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gray-800 ${stat.color} text-xl`}>
                      <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                  </div>
              </div>
          ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
              {presetQuizzes.map((quiz, idx) => (
                  <div key={idx} className="glass-card bg-gray-900/40 p-5 rounded-2xl border border-gray-800 flex items-center justify-between hover:bg-gray-800/40 transition-colors group cursor-pointer" onClick={() => { setTopic(quiz.title); generateQuiz(quiz.title); }}>
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${idx % 2 === 0 ? 'bg-cyan-900/20 text-cyan-400' : 'bg-purple-900/20 text-purple-400'}`}>
                              <i className="fas fa-brain"></i>
                          </div>
                          <div>
                              <h4 className="text-white font-bold text-lg mb-1">{quiz.title}</h4>
                              <p className="text-gray-500 text-sm">{quiz.topic}</p>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' : quiz.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}`}>
                              {quiz.difficulty}
                          </span>
                          <span className="text-gray-400 text-sm"><i className="far fa-clock mr-1"></i> {quiz.time}</span>
                          <span className="text-gray-400 text-sm">{quiz.q} questions</span>
                          {quiz.score ? (
                             <span className="text-yellow-400 font-bold bg-yellow-900/20 px-3 py-1 rounded-full">{quiz.score}</span>
                          ) : (
                             <i className="fas fa-arrow-right text-gray-600 group-hover:text-cyan-400 transition-colors"></i>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
