
import { LearningPath } from "./types";

export const AUDIO_SAMPLE_RATE = 16000;
export const AUDIO_OUTPUT_SAMPLE_RATE = 24000;

export const GEMINI_LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-09-2025";
export const GEMINI_PRO_MODEL = "gemini-2.5-flash";
export const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

export const AI_CALL_GREETINGS = [
  "Hey there! How's your day going? Ready to conquer the world?",
  "Hello! What's on your mind today? I'm all ears.",
  "Hi! Ready to learn something new or just want to chat?",
  "Greetings! How can I boost your confidence today?"
];

export const AI_CALL_SYSTEM_INSTRUCTION = "You are a helpful, confident friend. If the user speaks a language like Urdu, Hindi, Spanish, reply in that language fluently. Be concise and encouraging. Always greet warmly.";

export const CODING_HELPER_SYSTEM_INSTRUCTION = "You are a coding assistant. The user is writing code. Monitor their logic. If they pause or ask, help them. Be concise.";

const generateMockPath = (title: string): LearningPath => ({
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    description: `Master ${title} with this comprehensive guide.`,
    topics: [
        {
            id: 'basics',
            title: 'Fundamentals',
            description: `Core concepts of ${title}`,
            lessons: [
                { id: 'l1', title: 'Introduction', topic: `Introduction to ${title}` },
                { id: 'l2', title: 'Key Principles', topic: `Key principles of ${title}` }
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced Topics',
            description: `Deep dive into ${title}`,
            lessons: [
                { id: 'l3', title: 'Complex Systems', topic: `Advanced ${title} systems` },
                { id: 'l4', title: 'Real World Applications', topic: `Applying ${title} in real world` }
            ]
        }
    ]
});

export const DEFAULT_LEARNING_PATHS: LearningPath[] = [
    "Artificial Intelligence", "Data Structures", "Web Development", "Medical Science", 
    "Cybersecurity", "Prompt Engineering", "Cloud Computing", "Blockchain", "Psychology"
].map(generateMockPath);
