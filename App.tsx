
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Note } from "./types";

// Import Components
import { AICall } from "./AICall";
import { CodingHelper } from "./CodingHelper";
import LearnByDiagrams from "./LearnByDiagrams";
import { LearningPaths } from "./LearningPaths";
import { Interviews } from "./Interviews";
import { AIChat } from "./AIChat";
import { Quiz } from "./Quiz";
import { Settings } from "./Settings";
import { Dashboard } from "./Dashboard";
import { Analytics } from "./Analytics";
import { Achievements } from "./Achievements";
import { Profile } from "./Profile";
import { Login } from "./Login"; // Import Login
import { useAuth } from "./AuthContext";

// --- Icons (SVG Components) ---
const Icons = {
  Home: () => <i className="fas fa-home"></i>,
  Phone: () => <i className="fas fa-phone-alt"></i>,
  Map: () => <i className="fas fa-map-signs"></i>,
  Code: () => <i className="fas fa-code"></i>,
  UserTie: () => <i className="fas fa-user-tie"></i>,
  StickyNote: () => <i className="fas fa-sticky-note"></i>,
  SignOut: () => <i className="fas fa-sign-out-alt"></i>,
  Brain: () => <i className="fas fa-brain"></i>,
  Chat: () => <i className="fas fa-comments"></i>,
  Quiz: () => <i className="fas fa-question-circle"></i>,
  Cog: () => <i className="fas fa-cog"></i>,
  Chart: () => <i className="fas fa-chart-bar"></i>,
  Trophy: () => <i className="fas fa-trophy"></i>,
  User: () => <i className="far fa-user"></i>,
  Menu: () => <i className="fas fa-bars"></i>,
  Close: () => <i className="fas fa-times"></i>
};

// Notes Component
const Notes: React.FC<{ notes: Note[] }> = ({ notes }) => (
    <div className="p-6 bg-white h-full overflow-y-auto rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">My Notes</h2>
        <div className="grid gap-4">
            {notes.map(n => (
                <div key={n.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg text-purple-700">{n.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{n.date}</p>
                    <p className="text-gray-600 whitespace-pre-wrap line-clamp-3">{n.content}</p>
                </div>
            ))}
            {notes.length === 0 && <p className="text-gray-400">No notes saved yet.</p>}
        </div>
    </div>
);

export const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem("notes") || "[]"));
  const { user, logout, loading } = useAuth(); // Destructure loading
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Placeholder for topic selection from Dashboard/Paths
  const [currentTopic, setCurrentTopic] = useState("");

  // Loading State
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a] text-white"><i className="fas fa-circle-notch fa-spin text-4xl text-cyan-500"></i></div>;
  }

  // Not Logged In State
  if (!user) {
    return <Login />;
  }

  const saveNote = (title: string, content: string) => {
      const newNote: Note = { id: uuidv4(), title, content, date: new Date().toLocaleDateString(), type: 'general' };
      const updated = [newNote, ...notes];
      setNotes(updated);
      localStorage.setItem("notes", JSON.stringify(updated));
  };

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
      switch (activeTab) {
          case "dashboard": return <Dashboard onNavigate={handleNavClick} />;
          case "analytics": return <Analytics />;
          case "achievements": return <Achievements />;
          case "profile": return <Profile />;
          case "call": return <AICall />;
          case "chat": return <AIChat />;
          case "learning-paths": 
             return <LearningPaths onSelectTopic={(t) => { setCurrentTopic(t); handleNavClick('diagrams'); }} />;
          case "diagrams": 
             return <LearnByDiagrams onSaveNote={saveNote} />;
          case "code": return <CodingHelper />;
          case "interview": return <Interviews />;
          case "quiz": return <Quiz />;
          case "notes": return <Notes notes={notes} />;
          case "settings": return <Settings />;
          default: return <Dashboard onNavigate={handleNavClick} />;
      }
  };

  const NavItem = ({ id, icon, label }: { id: string, icon: any, label: string }) => (
      <button 
        onClick={() => handleNavClick(id)} 
        className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all mb-1 ${activeTab === id ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
      >
          <div className="w-6 text-center text-lg">{icon}</div>
          <span className="text-sm font-medium">{label}</span>
      </button>
  );

  return (
    <div className="flex h-screen w-screen bg-[#0f172a] overflow-hidden font-sans relative">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#0f1115] border-b border-gray-800 z-50 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    <i className="fas fa-brain text-white text-sm"></i>
                </div>
                <span className="text-white font-bold text-lg">TWS Ai</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white text-2xl p-2">
                {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Sidebar */}
        <div className={`fixed md:relative top-0 left-0 h-full w-64 bg-[#0f1115] flex flex-col p-4 border-r border-gray-800/50 z-50 transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} pt-20 md:pt-4`}>
            <div className="text-white text-2xl font-bold mb-8 items-center gap-3 px-2 hidden md:flex">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <i className="fas fa-brain text-white text-xl"></i>
                </div>
                <div>
                    <span className="block text-cyan-400 leading-none">TWS Ai</span>
                    <span className="text-[10px] text-gray-500 font-normal">The Wise Student Ai</span>
                </div>
            </div>

            <div className="mb-4 px-4 py-3 bg-gray-900/50 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-black text-lg">
                        {user?.displayName?.charAt(0) || 'A'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-white font-bold text-sm truncate">{user?.displayName || 'Student'}</p>
                        <div className="flex items-center gap-1 text-[10px] text-cyan-400 border border-cyan-900/50 bg-cyan-900/20 px-1.5 py-0.5 rounded">
                            <i className="fas fa-star"></i> Level 1
                        </div>
                    </div>
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>0 XP</span>
                    <span className="text-orange-400"><i className="fas fa-fire"></i> 0 days</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full" style={{ width: '10%' }}></div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar">
                <NavItem id="dashboard" icon={<Icons.Home />} label="Dashboard" />
                <NavItem id="chat" icon={<Icons.Chat />} label="AI Chat" />
                <NavItem id="call" icon={<Icons.Phone />} label="AI Call" />
                <NavItem id="code" icon={<Icons.Code />} label="Coding Helper" />
                <NavItem id="learning-paths" icon={<Icons.Map />} label="Learning Paths" />
                <NavItem id="diagrams" icon={<Icons.Brain />} label="Learn by Diagrams" />
                <NavItem id="quiz" icon={<Icons.Quiz />} label="Quizzes" />
                <NavItem id="notes" icon={<Icons.StickyNote />} label="My Notes" />
                <NavItem id="interview" icon={<Icons.UserTie />} label="Mock Interviews" />
                
                <div className="my-4 border-t border-gray-800/50"></div>
                
                <NavItem id="analytics" icon={<Icons.Chart />} label="Analytics" />
                <NavItem id="achievements" icon={<Icons.Trophy />} label="Achievements" />
                <NavItem id="profile" icon={<Icons.User />} label="My Profile" />
                <NavItem id="settings" icon={<Icons.Cog />} label="Settings" />
            </nav>
            
            <button onClick={logout} className="mt-4 flex items-center gap-3 p-3 text-red-400 hover:bg-white/5 rounded-xl transition-colors w-full group">
                <Icons.SignOut /> <span className="group-hover:translate-x-1 transition-transform">Logout</span>
            </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative bg-black w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-black pointer-events-none"></div>
            <main className="h-full relative z-10 pt-16 md:pt-0">
                {renderContent()}
            </main>
        </div>
    </div>
  );
};
