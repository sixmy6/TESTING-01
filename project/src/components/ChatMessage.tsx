import React from 'react';
import { Message } from '../types';
import { Flame, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
        isBot ? 'bg-gray-800 text-white' : 'bg-red-600 text-white'
      }`}>
        <p className="text-sm">{message.content}</p>
        <span className="text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}