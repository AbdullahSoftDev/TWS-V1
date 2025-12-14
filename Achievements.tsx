
import React from 'react';

export const Achievements: React.FC = () => {
  const achievements = [
    { title: 'First Steps', desc: 'Complete your first lesson', xp: 50, date: '1/1/2024', icon: 'fa-star', type: 'common', color: 'text-gray-300', bg: 'bg-gray-800' },
    { title: 'Week Warrior', desc: 'Study 7 days in a row', xp: 100, date: '1/7/2024', icon: 'fa-fire', type: 'rare', color: 'text-cyan-400', bg: 'bg-cyan-900/40' },
    { title: 'Quiz Master', desc: 'Score 90%+ in 10 quizzes', xp: 200, date: '1/10/2024', icon: 'fa-brain', type: 'epic', color: 'text-purple-400', bg: 'bg-purple-900/40' },
    { title: 'Speed Learner', desc: 'Complete 5 lessons in one day', xp: 150, date: '1/5/2024', icon: 'fa-bolt', type: 'rare', color: 'text-blue-400', bg: 'bg-blue-900/40' },
    { title: 'Early Bird', desc: 'Study before 7 AM', xp: 75, date: '1/3/2024', icon: 'fa-sun', type: 'common', color: 'text-gray-300', bg: 'bg-gray-800' },
    { title: 'Perfectionist', desc: 'Score 100% on any quiz', xp: 100, date: null, icon: 'fa-check-double', type: 'legendary', color: 'text-yellow-400', locked: true },
  ];

  const inProgress = [
      { title: 'Month Master', desc: 'Study 30 days in a row', xp: 500, current: 7, total: 30, type: 'legendary' },
      { title: 'Knowledge Seeker', desc: 'Complete 50 lessons', xp: 300, current: 31, total: 50, type: 'epic' },
      { title: 'Voice Champion', desc: 'Complete 20 AI calls', xp: 300, current: 8, total: 20, type: 'epic' },
  ];

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
       <div className="mb-8 flex justify-between items-end">
           <div>
               <p className="text-gray-400 text-sm mb-1">Earn badges and unlock rewards</p>
               <div className="grid grid-cols-3 gap-8 mt-6">
                   <div className="text-center">
                       <i className="fas fa-trophy text-yellow-400 text-3xl mb-2"></i>
                       <h3 className="text-2xl font-bold text-white">5/9</h3>
                       <p className="text-gray-500 text-xs">Achievements Unlocked</p>
                   </div>
                   <div className="text-center">
                       <i className="fas fa-bolt text-cyan-400 text-3xl mb-2"></i>
                       <h3 className="text-2xl font-bold text-white">575</h3>
                       <p className="text-gray-500 text-xs">Total XP Earned</p>
                   </div>
                   <div className="text-center">
                       <i className="far fa-star text-orange-400 text-3xl mb-2"></i>
                       <h3 className="text-2xl font-bold text-white">0</h3>
                       <p className="text-gray-500 text-xs">Legendary Badges</p>
                   </div>
               </div>
           </div>
       </div>

       <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
           {['All', 'Learning', 'Quizzes', 'Streaks', 'Habits', 'Speaking'].map((cat, i) => (
               <button key={i} className={`px-4 py-1.5 rounded-full text-xs font-medium ${i===0 ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                   {cat}
               </button>
           ))}
           <div className="ml-auto flex gap-2">
               <button className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"><i className="fas fa-check"></i> Unlocked</button>
               <button className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"><i className="fas fa-lock"></i> Locked</button>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
           {achievements.map((ach, idx) => (
               <div key={idx} className={`glass-card bg-gray-900/60 p-5 rounded-2xl border border-gray-800 relative group overflow-hidden ${ach.locked ? 'opacity-50' : ''}`}>
                   <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-gray-800 px-2 py-1 rounded text-gray-400">{ach.type}</span>
                   
                   <div className={`w-14 h-14 rounded-full ${ach.bg} ${ach.color} flex items-center justify-center text-2xl mb-4 ${ach.type === 'legendary' ? 'shadow-lg shadow-yellow-500/20' : ''}`}>
                       <i className={`fas ${ach.icon}`}></i>
                   </div>

                   <h3 className="text-white font-bold mb-1">{ach.title}</h3>
                   <p className="text-gray-500 text-xs mb-4">{ach.desc}</p>

                   <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                       <span className="text-yellow-400 font-bold text-sm">+{ach.xp} XP</span>
                       <span className="text-gray-600 text-xs">{ach.date || <i className="fas fa-lock"></i>}</span>
                   </div>
               </div>
           ))}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {inProgress.map((prog, idx) => (
               <div key={idx} className="glass-card bg-gray-900/60 p-5 rounded-2xl border border-gray-800 relative">
                   <div className="absolute top-0 left-0 w-1 h-full bg-cyan-900"></div>
                   <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-gray-800 px-2 py-1 rounded ${prog.type === 'legendary' ? 'text-yellow-500' : 'text-purple-400'}`}>{prog.type}</span>

                   <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 mb-3">
                       <i className="fas fa-lock"></i>
                   </div>

                   <h3 className="text-white font-bold mb-1">{prog.title}</h3>
                   <p className="text-gray-500 text-xs mb-4">{prog.desc}</p>

                   <div className="flex justify-between items-end mb-2">
                       <span className="text-xs text-gray-400">Progress</span>
                       <div className="text-right">
                           <span className="text-white font-bold">{prog.current}/{prog.total}</span>
                       </div>
                   </div>
                   <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
                       <div className="bg-cyan-600 h-1.5 rounded-full" style={{ width: `${(prog.current/prog.total)*100}%` }}></div>
                   </div>
                   <p className="text-right text-yellow-500 text-xs font-bold">+{prog.xp} XP</p>
               </div>
           ))}
       </div>
    </div>
  );
};
