import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from './firebaseClient';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  otpSent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  // Initialize Email.js
  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncUserToSupabase(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const syncUserToSupabase = async (firebaseUser: FirebaseUser) => {
    try {
      // Check if user exists in Supabase
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (!existingUser) {
        // Create new user in Supabase
        const { data: newUser } = await supabase
          .from('profiles')
          .insert({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            display_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
            avatar_url: firebaseUser.photoURL,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newUser) {
          setUser({
            id: newUser.firebase_uid,
            email: newUser.email,
            displayName: newUser.display_name,
            avatarUrl: newUser.avatar_url
          });
        }
      } else {
        setUser({
          id: existingUser.firebase_uid,
          email: existingUser.email,
          displayName: existingUser.display_name,
          avatarUrl: existingUser.avatar_url
        });
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const sendOTP = async (email: string) => {
    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP temporarily (in real app, use Redis or database)
      localStorage.setItem(`otp_${email}`, otp);
      
      // Send OTP via Email.js
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          otp_code: otp
        }
      );
      
      setOtpSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    const storedOtp = localStorage.getItem(`otp_${email}`);
    
    if (storedOtp === otp) {
      // In real app, you would sign in with custom token
      // For now, we'll create a temporary user
      setUser({
        id: `temp_${Date.now()}`,
        email,
        displayName: email.split('@')[0]
      });
      localStorage.removeItem(`otp_${email}`);
      setOtpSent(false);
    } else {
      throw new Error('Invalid OTP');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setOtpSent(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle, 
      sendOTP, 
      verifyOTP, 
      logout, 
      loading, 
      otpSent 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};