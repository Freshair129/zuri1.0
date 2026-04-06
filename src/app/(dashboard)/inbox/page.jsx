'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { usePusher } from '@/hooks/usePusher';
import { useSession } from '@/hooks/useSession';
import ConversationList from '@/components/inbox/ConversationList';
import ChatView from '@/components/inbox/ChatView';
import ReplyBox from '@/components/inbox/ReplyBox';
import RightPanel from '@/components/inbox/RightPanel';

// ─── Shape API conversation for ConversationList ──────────────────────────────
function shapeConversation(conv) {
  const lastMsg = conv.messages?.[0]
  const name    = conv.customer?.facebookName ?? conv.participantId ?? 'Unknown'
  return {
    id:          conv.id,
    name,
    customerId:  conv.customerId,
    channel:     conv.channel === 'facebook' ? 'FB' : 'LINE',
    status:      conv.status,
    lastMessage: lastMsg?.content ?? '',
    time:        lastMsg ? formatTime(lastMsg.createdAt) : '',
    unread:      0,  // TODO: track per-conversation unread count
  }
}

function shapeMessage(msg) {
  return {
    id:         msg.id,
    sender:     msg.sender,        // 'staff' | 'customer'
    senderName: msg.sender === 'staff' ? 'Staff' : null,
    text:       msg.content ?? '',
    time:       formatTime(msg.createdAt),
  }
}

function formatTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'เมื่อวาน'
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const { tenantId } = useSession()

  const [conversations, setConversations] = useState([])
  const [loadingList, setLoadingList]     = useState(true)
  const [selectedConv, setSelectedConv]   = useState(null)
  const [messages, setMessages]           = useState([])
  const [loadingMsgs, setLoadingMsgs]     = useState(false)
  const [customer, setCustomer]           = useState(null)
  const [sending, setSending]             = useState(false)

  // ── 1. Fetch conversation list ──────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res  = await fetch('/api/conversations?limit=30')
      const json = await res.json()
      setConversations((json.data ?? []).map(shapeConversation))
    } catch (err) {
      console.error('[InboxPage] fetchConversations', err)
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  // ── 2. Pusher: subscribe to new-message events ──────────────────────────────
  const pusherChannel = tenantId ? `tenant-${tenantId}` : null

  usePusher(pusherChannel, {
    onNewMessage: useCallback((data) => {
      const { conversationId, message } = data

      // Append to open conversation's message list
      setSelectedConv((current) => {
        if (current?.id === conversationId) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === message.id)
            if (exists) return prev
            return [...prev, shapeMessage(message)]
          })
        }
        return current
      })

      // Refresh conversation list (latest message + ordering)
      fetchConversations()
    }, [fetchConversations]),
  })

  // ── 3. Load messages on conversation select ─────────────────────────────────
  const handleSelectConversation = useCallback(async (conv) => {
    setSelectedConv(conv)
    setMessages([])
    setCustomer(null)
    setLoadingMsgs(true)

    try {
      const res  = await fetch(`/api/conversations/${conv.id}`)
      const json = await res.json()
      const data = json.data ?? {}
      setMessages((data.messages ?? []).map(shapeMessage))
      setCustomer(data.customer ?? null)
    } catch (err) {
      console.error('[InboxPage] fetchConversation', err)
    } finally {
      setLoadingMsgs(false)
    }
  }, [])

  // ── 4. Send reply ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!selectedConv || sending) return

    // Optimistic update
    const optimisticId  = `opt-${Date.now()}`
    const optimisticMsg = {
      id:         optimisticId,
      sender:     'staff',
      senderName: 'Staff',
      text,
      time:       formatTime(new Date().toISOString()),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setSending(true)

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/reply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text }),
      })
      if (!res.ok) throw new Error('Reply failed')
      const json = await res.json()

      // Swap optimistic with confirmed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, id: json.messageId ?? m.id } : m
        )
      )
    } catch (err) {
      console.error('[InboxPage] send', err)
      // Roll back optimistic
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
    } finally {
      setSending(false)
    }
  }, [selectedConv, sending])

  const handleUpdateCustomer = useCallback((updated) => setCustomer(updated), [])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden">
      {/* Left: Conversation List */}
      <ConversationList
        conversations={conversations}
        activeId={selectedConv?.id}
        onSelect={handleSelectConversation}
        loading={loadingList}
      />

      {/* Center: Chat View + Reply Box */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatView
          conversation={selectedConv}
          messages={messages}
          loading={loadingMsgs}
        />
        {selectedConv && (
          <ReplyBox
            onSend={handleSend}
            disabled={sending}
            placeholder={sending ? 'Sending...' : 'Type a message...'}
          />
        )}
      </div>

      {/* Right: Customer Profile + Activity */}
      <RightPanel
        customer={customer}
        onUpdate={handleUpdateCustomer}
      />
    </div>
  );
}
