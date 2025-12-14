
import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { LearningPath } from './types';
import { getGenAIInstance } from './geminiService';

interface LearningPathsProps {
  onSelectTopic: (topic: string) => void;
}

// Hardcoded paths matching the screenshot
const INITIAL_PATHS: LearningPath[] = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Master DSA from basics to advanced. Perfect for interviews.',
    level: 'Beginner',
    category: 'Interview Prep',
    duration: '40 hours',
    students: '12.5K',
    rating: 4.9,
    progress: 65,
    totalLessons: 48,
    completedLessons: 31,
    topics: []
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Learn to design scalable systems like the pros.',
    level: 'Advanced',
    category: 'Career Growth',
    duration: '30 hours',
    students: '8.2K',
    rating: 4.8,
    progress: 30,
    totalLessons: 32,
    completedLessons: 10,
    topics: []
  },
  {
    id: 'js-mastery',
    title: 'JavaScript Mastery',
    description: 'Deep dive into JavaScript from basics to advanced concepts.',
    level: 'All Levels',
    category: 'Web Dev',
    duration: '35 hours',
    students: '25.3K',
    rating: 4.9,
    progress: 85,
    totalLessons: 36,
    completedLessons: 30,
    topics: []
  }
];

export const LearningPaths: React.FC<LearningPathsProps> = ({ onSelectTopic }) => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>(INITIAL_PATHS);
  const [customSubject, setCustomSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCustomPath = async () => {
     // ... logic to call gemini and add to list ...
     // For UI match purpose, sticking to the visual requirement mostly
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Learning <span className="text-cyan-400">Paths</span></h1>
          <p className="text-gray-400">Choose your career track and start learning</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['All', 'In progress', 'Completed', 'New'].map((filter, idx) => (
              <button key={idx} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${idx === 0 ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  {filter}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-10">
          {learningPaths.map((path) => (
              <div key={path.id} className="glass-card bg-gray-900/80 border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-cyan-500/50 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${path.id === 'dsa' ? 'bg-cyan-500' : path.id === 'system-design' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                  
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-4">
                      <i className={`fas ${path.id === 'dsa' ? 'fa-database text-cyan-400' : path.id === 'system-design' ? 'fa-cloud text-orange-400' : 'fa-code text-yellow-400'} text-xl`}></i>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{path.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{path.description}</p>

                  <div className="flex gap-2 mb-4">
                      <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">{path.level}</span>
                      <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs">{path.category}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span><i className="far fa-clock mr-1"></i>{path.duration}</span>
                      <span><i className="fas fa-user-friends mr-1"></i>{path.students}</span>
                      <span className="text-yellow-500"><i className="fas fa-star mr-1"></i>{path.rating}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-800">
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>{path.completedLessons}/{path.totalLessons} lessons</span>
                          <span className={`${path.progress && path.progress > 50 ? 'text-green-400' : 'text-cyan-400'}`}>{path.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
                          <div className={`h-1.5 rounded-full ${path.id === 'dsa' ? 'bg-cyan-500' : path.id === 'system-design' ? 'bg-orange-500' : 'bg-yellow-500'}`} style={{ width: `${path.progress}%` }}></div>
                      </div>
                      
                      <Button onClick={() => onSelectTopic(path.title)} className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white rounded-xl py-2 flex items-center justify-center gap-2 group-hover:bg-gray-800 transition-all">
                          <i className="fas fa-play text-xs"></i> Continue
                      </Button>
                  </div>
              </div>
          ))}

          {/* Create New Block */}
          <div className="glass-card bg-gray-900/40 border border-gray-800 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-800/40 transition-all min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 text-cyan-500">
                  <i className="fas fa-plus text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Create Custom Path</h3>
              <p className="text-gray-400 text-sm mb-4">Generate a personalized learning track with AI</p>
              <div className="w-full">
                  <Input 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter topic..."
                    className="bg-gray-900 border-gray-700 text-white mb-2 w-full text-center"
                  />
                  <Button onClick={generateCustomPath} className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-6 py-2">
                      Generate
                  </Button>
              </div>
          </div>
      </div>
    </div>
  );
};
