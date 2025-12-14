
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { generateText } from './geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prompt engineering to encourage file generation in code blocks
      const prompt = `User Request: ${input}\n\nSystem Instruction: You are a helpful AI assistant. If the user asks for a file (like CSV, code, text, markdown, etc.), provide the content inside a markdown code block with the appropriate language tag (e.g., \`csv\`, \`python\`, \`json\`, \`markdown\`). I will parse these blocks to allow the user to download them as files. If asked for Excel/PDF/Word, provide the raw content (like CSV for Excel, Markdown for Word/PDF) and tell the user they can download it.`;
      
      const { text } = await generateText(prompt);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content: string, language: string) => {
    let extension = 'txt';
    let mimeType = 'text/plain';

    switch (language.toLowerCase()) {
      case 'csv': extension = 'csv'; mimeType = 'text/csv'; break;
      case 'json': extension = 'json'; mimeType = 'application/json'; break;
      case 'python': 
      case 'py': extension = 'py'; mimeType = 'text/x-python'; break;
      case 'javascript': 
      case 'js': extension = 'js'; mimeType = 'text/javascript'; break;
      case 'html': extension = 'html'; mimeType = 'text/html'; break;
      case 'css': extension = 'css'; mimeType = 'text/css'; break;
      case 'markdown': 
      case 'md': extension = 'md'; mimeType = 'text/markdown'; break;
      case 'xml': extension = 'xml'; mimeType = 'text/xml'; break;
      default: extension = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_file.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to render message with "Download" buttons for code blocks
  const renderMessageText = (text: string) => {
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex} className="whitespace-pre-wrap">{text.substring(lastIndex, match.index)}</span>);
      }

      const lang = match[1] || 'text';
      const content = match[2];

      // Code block with download button
      parts.push(
        <div key={match.index} className="my-2 rounded-md overflow-hidden border border-gray-300 shadow-sm">
          <div className="bg-gray-100 px-3 py-1 flex justify-between items-center border-b border-gray-300">
            <span className="text-xs font-bold text-gray-600 uppercase">{lang}</span>
            <button 
              onClick={() => downloadFile(content, lang)}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <i className="fas fa-download"></i> Download
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-3 overflow-x-auto text-sm font-mono m-0">
            {content}
          </pre>
        </div>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex} className="whitespace-pre-wrap">{text.substring(lastIndex)}</span>);
    }

    return parts;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="bg-blue-800 text-white p-4 font-bold text-xl flex items-center gap-2">
        <i className="fas fa-comments"></i> AI Chat & File Generator
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg">Ask me to generate files like CSVs, Code, or Summaries.</p>
            <p className="text-sm">Example: "Generate a CSV of the solar system planets"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
              {renderMessageText(msg.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-xl rounded-bl-none border border-gray-200 shadow-sm">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          placeholder="Type your request here..."
          className="flex-1"
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
          <i className="fas fa-paper-plane"></i>
        </Button>
      </div>
    </div>
  );
};
