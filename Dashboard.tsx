
import React from 'react';
import { Button } from './Button';

interface DashboardProps {
    onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Hardcoded stats from screenshot
  const stats = [
    { label: 'Study Time', value: '12.5 hrs', sub: 'This week', icon: 'fa-clock', color: 'text-cyan-400' },
    { label: 'Goals Met', value: '8/10', sub: 'This month', icon: 'fa-bullseye', color: 'text-orange-400' },
    { label: 'Improvement', value: '+23%', sub: 'vs last week', icon: 'fa-chart-line', color: 'text-green-400' },
    { label: 'Achievements', value: '15', sub: 'Total earned', icon: 'fa-medal', color: 'text-yellow-400' },
  ];

  const continueLearning = [
    { title: 'Data Structures', progress: 65, label: '16/24 lessons', color: 'bg-cyan-500', icon: 'fa-book-open' },
    { title: 'System Design', progress: 30, label: '6/20 lessons', color: 'bg-blue-500', icon: 'fa-project-diagram' },
    { title: 'JavaScript Mastery', progress: 85, label: '26/30 lessons', color: 'bg-yellow-500', icon: 'fa-js' },
  ];

  const recentBadges = [
    { title: '7 Day Streak', icon: 'fa-fire', color: 'text-orange-500', bg: 'bg-orange-900/20' },
    { title: 'First Quiz', icon: 'fa-star', color: 'text-yellow-500', bg: 'bg-yellow-900/20' },
    { title: 'Speed Learner', icon: 'fa-bolt', color: 'text-cyan-500', bg: 'bg-cyan-900/20' },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, <span className="text-cyan-400">Student!</span></h1>
        <p className="text-gray-400">Ready to boost your confidence today?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card bg-gray-900/50 p-6 rounded-2xl border border-gray-800 relative overflow-hidden group hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-gray-800 ${stat.color}`}>
                <i className={`fas ${stat.icon} text-xl`}></i>
              </div>
              <span className="text-xs text-gray-500">{stat.sub}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div onClick={() => onNavigate('call')} className="glass-card bg-gray-900/50 p-6 rounded-2xl border border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-phone-alt text-white text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Start AI Call</h3>
            <p className="text-gray-400 text-sm">Practice speaking</p>
        </div>
        <div onClick={() => onNavigate('chat')} className="glass-card bg-gray-900/50 p-6 rounded-2xl border border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-comment-alt text-white text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">AI Chat</h3>
            <p className="text-gray-400 text-sm">Ask anything</p>
        </div>
        <div onClick={() => onNavigate('diagrams')} className="glass-card bg-gray-900/50 p-6 rounded-2xl border border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-all group">
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-brain text-white text-xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Learn Visually</h3>
            <p className="text-gray-400 text-sm">Diagrams & more</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2 glass-card bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Continue Learning</h2>
                <button onClick={() => onNavigate('dashboard')} className="text-cyan-400 text-sm hover:underline">View All <i className="fas fa-arrow-right ml-1"></i></button>
            </div>
            <div className="space-y-4">
                {continueLearning.map((item, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-4 rounded-xl flex items-center gap-4 hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-20 flex items-center justify-center text-white`}>
                             <i className={`fas ${item.icon}`}></i>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-semibold">{item.title}</h4>
                            <p className="text-gray-500 text-xs mb-2">{item.label}</p>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Column: Badges & Daily Goal */}
        <div className="space-y-6">
            <div className="glass-card bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Recent Badges</h2>
                    <button onClick={() => onNavigate('achievements')} className="text-cyan-400 text-sm hover:underline">All <i className="fas fa-arrow-right ml-1"></i></button>
                </div>
                <div className="space-y-3">
                    {recentBadges.map((badge, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30">
                            <div className={`w-8 h-8 rounded-full ${badge.bg} ${badge.color} flex items-center justify-center`}>
                                <i className={`fas ${badge.icon}`}></i>
                            </div>
                            <span className="text-gray-200 font-medium">{badge.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-6 rounded-2xl border border-cyan-800/30">
                <div className="flex items-start gap-4 mb-4">
                     <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <i className="fas fa-bullseye text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Daily Goal: 30 minutes</h3>
                        <p className="text-cyan-200 text-sm">You've studied 18 minutes today. Keep going!</p>
                    </div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-4">
                    <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl py-3 font-semibold shadow-lg shadow-cyan-500/20">
                    Practice Now
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};
