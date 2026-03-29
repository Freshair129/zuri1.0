'use client';

import { useEffect, useRef } from 'react';

function MessageBubble({ message }) {
  const isStaff = message.sender === 'staff';
  return (
    <div className={`flex items-end gap-2 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isStaff && (
        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0">
          {message.senderName?.[0]?.toUpperCase() ?? 'C'}
        </div>
      )}
      <div className={`max-w-xs lg:max-w-md ${isStaff ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isStaff
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
            }
          `}
        >
          {message.text}
        </div>
        <span className="text-[11px] text-gray-400 px-1">{message.time}</span>
      </div>
    </div>
  );
}

export default function ChatView({
  conversation = null,
  messages = [],
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
        <p>Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
          {conversation.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{conversation.name}</p>
          <p className="text-xs text-gray-500">{conversation.channel} · {conversation.status ?? 'Active'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id ?? idx} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
