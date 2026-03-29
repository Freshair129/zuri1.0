export default function InboxPage() {
  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Left: Conversation List */}
      <div className="w-80 border-r" />
      {/* Center: Chat View */}
      <div className="flex-1" />
      {/* Right: Customer Card + Quick Sale */}
      <div className="w-80 border-l" />
    </div>
  )
}
