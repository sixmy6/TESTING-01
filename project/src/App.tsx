import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatState } from './types';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Flame } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const INITIAL_MESSAGE: Message = {
  id: '1',
  content: "Halo kawanku, apakah ada pertanyaan, bertanyalah karena bertanya itu gratis kawan?",
  sender: 'bot',
  timestamp: new Date(),
};

// Initialize Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if API key is available
if (!API_KEY) {
  console.error('Kunci API Gemini tidak ditemukan. Mohon tambahkan VITE_GEMINI_API_KEY ke environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isTyping: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const generateResponse = async (userMessage: string) => {
    if (!API_KEY) {
      return {
        id: Date.now().toString(),
        content: "Error: Kunci API Gemini belum dikonfigurasi. Mohon tambahkan kunci API ke environment variables.",
        sender: 'bot' as const,
        timestamp: new Date(),
      };
    }

    try {
      const chat = model.startChat({
        history: chatState.messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: msg.content,
        })),
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(userMessage + "\n\nBerikan jawaban dalam bahasa Indonesia.");
      const response = await result.response;
      const text = response.text();

      return {
        id: Date.now().toString(),
        content: text,
        sender: 'bot' as const,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        id: Date.now().toString(),
        content: "Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi.",
        sender: 'bot' as const,
        timestamp: new Date(),
      };
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
    }));

    const botResponse = await generateResponse(content);

    setChatState(prev => ({
      messages: [...prev.messages, botResponse],
      isTyping: false,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flame className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold">Chat #666</h1>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-xl">
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {chatState.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {chatState.isTyping && (
              <div className="flex gap-2 items-center text-gray-400">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>Sedang berpikir...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t border-gray-700 p-4">
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={chatState.isTyping}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;