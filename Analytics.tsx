
import React from 'react';

export const Analytics: React.FC = () => {
  // Hardcoded data matching screenshot
  const stats = [
    { label: 'Total Study Time', value: '7.5 hrs', sub: '+12%', color: 'text-cyan-400' },
    { label: 'Topics Covered', value: '27', sub: '+5', color: 'text-orange-400' },
    { label: 'Goals Achieved', value: '8/10', sub: '80%', color: 'text-green-400' },
    { label: 'Current Streak', value: '7 days', sub: 'Best: 14', color: 'text-yellow-400' },
  ];

  const topicProgress = [
      { name: 'Data Structures', val: 80, time: '12h' },
      { name: 'Algorithms', val: 60, time: '9h' },
      { name: 'System Design', val: 40, time: '6h' },
      { name: 'JavaScript', val: 90, time: '15h' },
      { name: 'React', val: 55, time: '8h' },
  ];

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
       <div className="mb-6">
           <p className="text-gray-400 text-sm">Track your learning progress</p>
       </div>

       {/* Top Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           {stats.map((stat, idx) => (
               <div key={idx} className="glass-card bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
                   <div className="flex justify-between items-start mb-2">
                       <i className={`far fa-clock ${stat.color} text-lg`}></i>
                       <span className="text-green-400 text-xs bg-green-900/20 px-2 py-1 rounded">{stat.sub}</span>
                   </div>
                   <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                   <p className="text-gray-500 text-xs uppercase">{stat.label}</p>
               </div>
           ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           {/* Weekly Activity Chart (Mock) */}
           <div className="glass-card bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
               <h3 className="text-white font-bold mb-6">Weekly Activity</h3>
               <div className="h-48 flex items-end justify-between px-4 gap-2">
                   {[40, 60, 30, 80, 50, 90, 20].map((h, i) => (
                       <div key={i} className="w-full bg-gray-800 rounded-t-lg relative group">
                           <div className="absolute bottom-0 w-full bg-cyan-500 rounded-t-lg transition-all hover:bg-cyan-400" style={{ height: `${h}%` }}></div>
                       </div>
                   ))}
               </div>
               <div className="flex justify-between mt-2 text-xs text-gray-500 px-4">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
               </div>
               <div className="flex justify-between mt-6 text-xs text-gray-400 border-t border-gray-800 pt-4">
                   <span>Total: 465 minutes</span>
                   <span>Avg: 66 min/day</span>
               </div>
           </div>

           {/* Topic Progress */}
           <div className="glass-card bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
               <h3 className="text-white font-bold mb-6">Topic Progress</h3>
               <div className="space-y-6">
                   {topicProgress.map((topic, i) => (
                       <div key={i}>
                           <div className="flex justify-between text-sm text-gray-300 mb-2">
                               <span className="font-medium">{topic.name}</span>
                               <span className="text-gray-500">{topic.time}</span>
                           </div>
                           <div className="w-full bg-gray-800 rounded-full h-2">
                               <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${topic.val}%` }}></div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-card bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
               <h3 className="text-white font-bold mb-4">Insights</h3>
               <div className="space-y-4">
                   <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0"><i className="fas fa-chart-line"></i></div>
                       <div>
                           <h4 className="text-white text-sm font-bold">Best Performance</h4>
                           <p className="text-gray-500 text-xs">JavaScript - 85% completion</p>
                       </div>
                   </div>
                   <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0"><i className="fas fa-exclamation-triangle"></i></div>
                       <div>
                           <h4 className="text-white text-sm font-bold">Needs Attention</h4>
                           <p className="text-gray-500 text-xs">System Design - only 40%</p>
                       </div>
                   </div>
                   <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0"><i className="fas fa-clock"></i></div>
                       <div>
                           <h4 className="text-white text-sm font-bold">Peak Study Time</h4>
                           <p className="text-gray-500 text-xs">Saturdays, 10 AM - 12 PM</p>
                       </div>
                   </div>
               </div>
           </div>

           <div className="glass-card bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
               <h3 className="text-white font-bold mb-4">Recent Achievements</h3>
               <div className="space-y-4">
                   <div className="flex justify-between items-center">
                       <div className="flex gap-3 items-center">
                           <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center"><i className="fas fa-medal"></i></div>
                           <div>
                               <h4 className="text-white text-sm font-bold">Week Warrior</h4>
                               <p className="text-gray-500 text-xs">Study 7 days in a row</p>
                           </div>
                       </div>
                       <span className="text-xs text-gray-600">Today</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <div className="flex gap-3 items-center">
                           <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center"><i className="fas fa-brain"></i></div>
                           <div>
                               <h4 className="text-white text-sm font-bold">Quiz Master</h4>
                               <p className="text-gray-500 text-xs">Score 90%+ in 5 quizzes</p>
                           </div>
                       </div>
                       <span className="text-xs text-gray-600">2 days ago</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <div className="flex gap-3 items-center">
                           <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center"><i className="fas fa-sun"></i></div>
                           <div>
                               <h4 className="text-white text-sm font-bold">Early Bird</h4>
                               <p className="text-gray-500 text-xs">Study before 7 AM</p>
                           </div>
                       </div>
                       <span className="text-xs text-gray-600">3 days ago</span>
                   </div>
               </div>
           </div>

           <div className="glass-card bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
               <h3 className="text-white font-bold mb-4">Weekly Goals</h3>
               <div className="space-y-4">
                   <div>
                       <div className="flex justify-between text-xs text-gray-300 mb-1">
                           <span>Study 30 min daily</span>
                           <span>6/7</span>
                       </div>
                       <div className="w-full bg-gray-800 rounded-full h-1.5">
                           <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-xs text-gray-300 mb-1">
                           <span>Complete 3 quizzes</span>
                           <span>2/3</span>
                       </div>
                       <div className="w-full bg-gray-800 rounded-full h-1.5">
                           <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '66%' }}></div>
                       </div>
                   </div>
                   <div>
                       <div className="flex justify-between text-xs text-gray-300 mb-1">
                           <span>Learn 5 new topics</span>
                           <span>5/5</span>
                       </div>
                       <div className="w-full bg-gray-800 rounded-full h-1.5">
                           <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                       </div>
                   </div>
                    <div>
                       <div className="flex justify-between text-xs text-gray-300 mb-1">
                           <span>Practice AI calls</span>
                           <span>4/5</span>
                       </div>
                       <div className="w-full bg-gray-800 rounded-full h-1.5">
                           <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                       </div>
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
};
