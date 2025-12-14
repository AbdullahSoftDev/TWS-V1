
export interface DiagramStep {
  text: string;
  imageUrl?: string;
  audioBase64?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'chat' | 'diagram' | 'general';
}

export interface Lesson {
    id: string;
    title: string;
    topic: string;
}

export interface TopicBlock {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    level?: string;
    category?: string;
    duration?: string;
    students?: string;
    rating?: number;
    progress?: number;
    totalLessons?: number;
    completedLessons?: number;
    topics: TopicBlock[];
}

export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streak: number;
    totalStudyTime: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    xp: number;
    date: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    icon: string;
    unlocked: boolean;
    progress?: number;
    totalRequired?: number;
}

export class ApiKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ApiKeyError";
    }
}
