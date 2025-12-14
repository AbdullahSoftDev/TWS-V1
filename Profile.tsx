
import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from './Button';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="h-full p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-cyan-400 mb-2">My Profile</h1>
        <p className="text-gray-400 mb-8">Manage your account and track your progress</p>

        <div className="glass-card bg-gray-900/80 border border-gray-800 rounded-3xl p-8 mb-8">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center text-4xl font-bold text-black border-4 border-gray-800 shadow-xl shadow-cyan-500/20">
                        {user?.displayName?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{user?.displayName || 'Student'}</h2>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                </div>
                <Button className="bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/50 rounded-xl px-6 py-2 flex items-center gap-2">
                    <i className="fas fa-pen text-xs"></i> Edit
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Account Details</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-300">
                            <i className="far fa-envelope w-5 text-gray-500"></i>
                            {user?.email}
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <i className="far fa-calendar w-5 text-gray-500"></i>
                            Joined Recently
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center border border-gray-700">
                    <i className="far fa-star text-yellow-400 text-xl mb-2"></i>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-xs text-gray-500">Total XP</div>
                </div>
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center border border-gray-700">
                    <i className="fas fa-trophy text-cyan-400 text-xl mb-2"></i>
                    <div className="text-2xl font-bold text-white">Level 1</div>
                    <div className="text-xs text-gray-500">Current Level</div>
                </div>
                <div className="bg-gray-800/50 rounded-2xl p-4 text-center border border-gray-700">
                    <i className="fas fa-fire text-orange-400 text-xl mb-2"></i>
                    <div className="text-2xl font-bold text-white">0</div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                </div>
            </div>
        </div>

        <div className="glass-card bg-gray-900/80 border border-gray-800 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-4">Level Progress</h3>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Level 1</span>
                <span>0/500 XP to next level</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 h-3 rounded-full" style={{ width: '5%' }}></div>
            </div>
        </div>
    </div>
  );
};
