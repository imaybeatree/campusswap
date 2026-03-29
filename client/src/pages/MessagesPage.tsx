import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { http, imageUrl } from "@/lib/http";
import { getToken, signOut } from "@/lib/token";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import logo from "@/assets/campusswap_logo.png";

function getCurrentUserId(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]!));
    return Number(payload.sub);
  } catch {
    return null;
  }
}

interface Conversation {
  listing_id: number;
  other_user_id: number;
  listing_title: string;
  listing_image_url: string | null;
  other_username: string;
  last_message: string;
  last_sender_id: number;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { listingId, otherUserId } = useParams();
  const [currentUserId] = useState(() => getCurrentUserId());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatarSrc = currentUserId ? imageUrl(`/api/users/${currentUserId}/avatar`) : null;

  // Load conversations
  useEffect(() => {
    if (!currentUserId) return;
    http()
      .get<Conversation[]>("/api/messages/conversations")
      .then((res) => setConversations(res.data))
      .catch(console.error);
  }, [currentUserId]);

  // If URL has params, select that conversation
  useEffect(() => {
    if (listingId && otherUserId && conversations.length > 0) {
      const match = conversations.find(
        (c) => c.listing_id === Number(listingId) && c.other_user_id === Number(otherUserId)
      );
      if (match) setActiveConvo(match);
    }
  }, [listingId, otherUserId, conversations]);

  // Load thread when active conversation changes
  useEffect(() => {
    if (!activeConvo || !currentUserId) return;
    http()
      .get<Message[]>(`/api/messages/thread/${activeConvo.listing_id}/${activeConvo.other_user_id}`)
      .then((res) => {
        setMessages(res.data);
        // Clear unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            c.listing_id === activeConvo.listing_id && c.other_user_id === activeConvo.other_user_id
              ? { ...c, unread_count: 0 }
              : c
          )
        );
      })
      .catch(console.error);
  }, [activeConvo, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!activeConvo || !newMessage.trim() || sending) return;
    setSending(true);
    try {
      await http().post("/api/messages", {
        receiver_id: activeConvo.other_user_id,
        listing_id: activeConvo.listing_id,
        content: newMessage.trim(),
      });
      setNewMessage("");
      // Reload thread
      const res = await http().get<Message[]>(
        `/api/messages/thread/${activeConvo.listing_id}/${activeConvo.other_user_id}`
      );
      setMessages(res.data);
      // Update last message in conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.listing_id === activeConvo.listing_id && c.other_user_id === activeConvo.other_user_id
            ? { ...c, last_message: newMessage.trim(), last_message_at: new Date().toISOString(), last_sender_id: currentUserId! }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-black border-border px-6 py-4 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="CampusSwap" className="h-8 w-8" />
            <span className="text-xl text-white font-bold">CampusSwap</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button className="bg-white text-black cursor-pointer" onClick={() => navigate("/listings/new")}>
              Sell Item
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer outline-none">
                <Avatar className="h-9 w-9 border-2 border-white/30 hover:border-white transition">
                  {avatarSrc && <AvatarImage src={avatarSrc} />}
                  <AvatarFallback className="bg-white text-black font-semibold text-sm">
                    {currentUserId?.toString().charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/home")}>
                  Browse Listings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/my-listings")}>
                  My Listings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile/edit")}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Conversations sidebar */}
        <div className="w-80 border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((convo) => {
                const isActive =
                  activeConvo?.listing_id === convo.listing_id &&
                  activeConvo?.other_user_id === convo.other_user_id;
                return (
                  <button
                    key={`${convo.listing_id}-${convo.other_user_id}`}
                    onClick={() => setActiveConvo(convo)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-muted/50 transition cursor-pointer ${
                      isActive ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={imageUrl(`/api/users/${convo.other_user_id}/avatar`)!} />
                        <AvatarFallback className="font-semibold text-sm">
                          {convo.other_username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm truncate">{convo.other_username}</span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {formatTime(convo.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {convo.listing_title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {convo.last_sender_id === currentUserId ? "You: " : ""}
                            {convo.last_message}
                          </p>
                          {convo.unread_count > 0 && (
                            <span className="ml-2 shrink-0 bg-black text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                              {convo.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread area */}
        <div className="flex-1 flex flex-col">
          {!activeConvo ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-1">Select a conversation</p>
                <p className="text-sm">Choose from your existing conversations on the left</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={imageUrl(`/api/users/${activeConvo.other_user_id}/avatar`)!} />
                  <AvatarFallback className="font-semibold text-sm">
                    {activeConvo.other_username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{activeConvo.other_username}</p>
                  <Link
                    to={`/listings/${activeConvo.listing_id}`}
                    className="text-xs text-muted-foreground hover:underline truncate block"
                  >
                    {activeConvo.listing_title}
                  </Link>
                </div>
                {activeConvo.listing_image_url && (
                  <Link to={`/listings/${activeConvo.listing_id}`} className="ml-auto shrink-0">
                    <img
                      src={imageUrl(activeConvo.listing_image_url)!}
                      alt={activeConvo.listing_title}
                      className="h-10 w-10 rounded object-cover"
                    />
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          isMine
                            ? "bg-black text-white rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isMine ? "text-white/60" : "text-muted-foreground"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
