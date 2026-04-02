'use client';

import { useState, useEffect } from 'react';
import ConversationList from '@/components/inbox/ConversationList';
import ChatView from '@/components/inbox/ChatView';
import ReplyBox from '@/components/inbox/ReplyBox';
import RightPanel from '@/components/inbox/RightPanel';

// Mock conversations for initial view
const MOCK_CONVERSATIONS = [
  { id: 'conv-1', name: 'John Doe', lastMessage: 'Saw your ad about the cooking class!', time: '12:45', channel: 'FB', unread: 2, customerId: 'cust-1' },
  { id: 'conv-2', name: 'Jane Smith', lastMessage: 'Thank you for the recipe.', time: 'Yesterday', channel: 'LINE', unread: 0, customerId: 'cust-2' },
];

export default function InboxPage() {
  const [selectedConv, setSelectedConv] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch customer details when a conversation is selected
  useEffect(() => {
    if (selectedConv?.customerId) {
      setLoading(true);
      fetch(`/api/customers/${selectedConv.customerId}`)
        .then(res => res.json())
        .then(res => {
          setCustomer(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setCustomer(null);
    }
  }, [selectedConv]);

  const handleUpdateCustomer = (updated) => {
    setCustomer(updated);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden">
      {/* Left: Conversation List */}
      <ConversationList 
        conversations={MOCK_CONVERSATIONS} 
        activeId={selectedConv?.id}
        onSelect={setSelectedConv}
      />

      {/* Center: Chat View */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatView 
          conversation={selectedConv} 
          messages={[]} // Handled in Phase 4
        />
        {selectedConv && <ReplyBox />}
      </div>

      {/* Right: Customer Profile & Activity (FEAT02) */}
      <RightPanel 
        customer={customer} 
        onUpdate={handleUpdateCustomer}
      />
    </div>
  );
}
