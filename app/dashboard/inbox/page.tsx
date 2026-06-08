"use client"

import { useState } from "react"
import { Search, Paperclip, Send, Phone, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  from: "me" | "them"
  text: string
  time: string
  type: "text" | "image" | "audio"
}

interface Chat {
  id: number
  name: string
  phone: string
  preview: string
  time: string
  unread: number
  status: "online" | "offline" | "away"
  messages: Message[]
}

const CHATS: Chat[] = [
  {
    id: 1,
    name: "Ahmed Mohamed",
    phone: "+20 123 456 7890",
    preview: "What is the price?",
    time: "Just now",
    unread: 2,
    status: "online",
    messages: [
      { id: 1, from: "them", text: "Hello, I need some information.", time: "10:28", type: "text" },
      { id: 2, from: "me", text: "Hi Ahmed! Of course, how can I help you?", time: "10:29", type: "text" },
      { id: 3, from: "them", text: "What is the price for the Pro plan?", time: "10:31", type: "text" },
      { id: 4, from: "them", text: "What is the price?", time: "10:32", type: "text" },
    ],
  },
  {
    id: 2,
    name: "Fatima Al-Rashid",
    phone: "+966 50 123 4567",
    preview: "When is my order ready?",
    time: "3m ago",
    unread: 1,
    status: "online",
    messages: [
      { id: 1, from: "them", text: "Hi, I placed an order yesterday.", time: "10:10", type: "text" },
      { id: 2, from: "me", text: "Hello Fatima! Let me check on that for you.", time: "10:11", type: "text" },
      { id: 3, from: "them", text: "When is my order ready?", time: "10:15", type: "text" },
    ],
  },
  {
    id: 3,
    name: "James Wilson",
    phone: "+44 7911 123456",
    preview: "Do you offer delivery?",
    time: "12m ago",
    unread: 0,
    status: "away",
    messages: [
      { id: 1, from: "them", text: "Do you offer delivery to the UK?", time: "09:55", type: "text" },
      { id: 2, from: "me", text: "Yes, we ship internationally! Delivery to UK takes 5–7 business days.", time: "10:00", type: "text" },
      { id: 3, from: "them", text: "Do you offer delivery?", time: "10:02", type: "text" },
      { id: 4, from: "me", text: "We sure do! Free delivery on orders over $50.", time: "10:05", type: "text" },
    ],
  },
  {
    id: 4,
    name: "Nour Hassan",
    phone: "+20 100 987 6543",
    preview: "Is this product available?",
    time: "1h ago",
    unread: 0,
    status: "offline",
    messages: [
      { id: 1, from: "them", text: "Is the blue variant still available?", time: "09:20", type: "text" },
      { id: 2, from: "me", text: "Let me check stock for you!", time: "09:22", type: "text" },
      { id: 3, from: "them", text: "Is this product available?", time: "09:30", type: "text" },
      { id: 4, from: "me", text: "Yes, the blue variant is in stock. Would you like to place an order?", time: "09:35", type: "text" },
    ],
  },
  {
    id: 5,
    name: "Carlos Rivera",
    phone: "+52 55 1234 5678",
    preview: "How do I track my shipment?",
    time: "2h ago",
    unread: 0,
    status: "offline",
    messages: [
      { id: 1, from: "them", text: "I ordered last week, order #5521.", time: "08:10", type: "text" },
      { id: 2, from: "me", text: "Hi Carlos! I can help you track that.", time: "08:12", type: "text" },
      { id: 3, from: "them", text: "How do I track my shipment?", time: "08:15", type: "text" },
      { id: 4, from: "me", text: "Visit track.basmaweb.com and enter your order number.", time: "08:20", type: "text" },
    ],
  },
]

const statusColor: Record<Chat["status"], string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-zinc-500",
}

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState<Chat>(CHATS[0])
  const [search, setSearch] = useState("")
  const [input, setInput] = useState("")

  const filtered = CHATS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  )

  return (
    <div className="flex h-[calc(100vh-0px)] lg:h-screen">
      {/* Chat list */}
      <div className="w-full lg:w-[30%] border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h1 className="text-base font-semibold text-foreground mb-3">Inbox</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-muted/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-border/30",
                selectedChat.id === chat.id
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : "hover:bg-muted/30"
              )}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                  {chat.name.charAt(0)}
                </div>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
                    statusColor[chat.status]
                  )}
                />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-foreground truncate">{chat.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">{chat.preview}</span>
                  {chat.unread > 0 && (
                    <Badge className="ml-2 shrink-0 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window — hidden on mobile when no chat selected via the list */}
      <div className="hidden lg:flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                {selectedChat.name.charAt(0)}
              </div>
              <span
                className={cn(
                  "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
                  statusColor[selectedChat.status]
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{selectedChat.name}</p>
              <p className="text-xs text-muted-foreground">{selectedChat.phone}</p>
            </div>
            <Badge
              variant={selectedChat.status === "online" ? "default" : "secondary"}
              className="text-[10px]"
            >
              {selectedChat.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Call">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="More options">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
          {selectedChat.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex", msg.from === "me" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
                  msg.from === "me"
                    ? "bg-green-600 text-white rounded-br-sm"
                    : "bg-zinc-800 text-foreground rounded-bl-sm"
                )}
              >
                <p>{msg.text}</p>
                <p
                  className={cn(
                    "text-[10px] mt-1 text-right",
                    msg.from === "me" ? "text-white/70" : "text-muted-foreground"
                  )}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Send bar */}
        <div className="px-6 py-4 border-t border-border bg-card/30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" aria-label="Attach file">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setInput("")}
              className="flex-1 bg-muted/30"
            />
            <Button
              size="icon-sm"
              onClick={() => setInput("")}
              aria-label="Send message"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
