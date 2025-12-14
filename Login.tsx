
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from './Button';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [view, setView] = useState<'login' | 'register' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        login(email);
        setIsLoading(false);
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
        setIsLoading(false);
        setView('otp');
    }, 1500);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
        login(email);
        setIsLoading(false);
    }, 1500);
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-[#0f172a] z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-purple-900/20"></div>
      </div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 border border-gray-700 bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-4">
                <i className="fas fa-brain text-white text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">TWS Ai</h1>
            <p className="text-cyan-400 text-sm font-medium tracking-wide">The Wise Student Ai learning Platform</p>
        </div>

        {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-gray-400 text-sm mb-2 ml-1">Email Address</label>
                    <div className="relative">
                        <i className="fas fa-envelope absolute left-4 top-3.5 text-gray-500"></i>
                        <Input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@example.com"
                            className="w-full bg-gray-800/50 border-gray-700 text-white pl-10 py-3 rounded-xl focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2 ml-1">Password</label>
                    <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-3.5 text-gray-500"></i>
                        <Input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-800/50 border-gray-700 text-white pl-10 py-3 rounded-xl focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                    <div className="text-right mt-2">
                        <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300">Forgot Password?</a>
                    </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/20 mt-4">
                    {isLoading ? <LoadingSpinner size="sm"/> : 'Sign In'}
                </Button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-900 text-gray-500">Or continue with</span></div>
                </div>

                <button type="button" className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Google
                </button>

                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">Don't have an account? <button type="button" onClick={() => setView('register')} className="text-cyan-400 font-bold hover:underline">Sign up</button></p>
                </div>
            </form>
        )}

        {view === 'register' && (
             <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div>
                    <label className="block text-gray-400 text-sm mb-2 ml-1">Email Address</label>
                    <Input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full bg-gray-800/50 border-gray-700 text-white py-3 rounded-xl focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2 ml-1">Create Password</label>
                    <Input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-800/50 border-gray-700 text-white py-3 rounded-xl focus:ring-cyan-500"
                        required
                    />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-xl font-bold mt-4">
                    {isLoading ? <LoadingSpinner size="sm"/> : 'Create Account'}
                </Button>

                <div className="text-center mt-6">
                    <p className="text-gray-400 text-sm">Already have an account? <button type="button" onClick={() => setView('login')} className="text-cyan-400 font-bold hover:underline">Log in</button></p>
                </div>
            </form>
        )}

        {view === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-6 animate-fade-in text-center">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-400">
                        <i className="fas fa-envelope-open-text text-xl"></i>
                    </div>
                    <h3 className="text-white text-xl font-bold">Check your email</h3>
                    <p className="text-gray-400 text-sm mt-2">We sent a verification code to <br/><span className="text-white">{email}</span></p>
                </div>

                <div className="flex justify-center gap-2">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            className="w-10 h-12 bg-gray-800 border border-gray-600 rounded-lg text-center text-white text-xl font-bold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                            value={data}
                            onChange={(e) => handleOtpChange(e.target, index)}
                            onFocus={(e) => e.target.select()}
                        />
                    ))}
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold">
                    {isLoading ? <LoadingSpinner size="sm"/> : 'Verify & Continue'}
                </Button>

                <p className="text-gray-500 text-xs">Didn't receive code? <button type="button" className="text-cyan-400 hover:underline">Resend</button></p>
                <button type="button" onClick={() => setView('register')} className="text-gray-500 text-sm hover:text-white"><i className="fas fa-arrow-left mr-1"></i> Back</button>
            </form>
        )}
      </div>
    </div>
  );
};
