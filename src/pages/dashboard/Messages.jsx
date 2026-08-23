import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HiOutlineChat,
  HiOutlinePaperAirplane,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineDotsVertical,
} from "react-icons/hi";
import useAuthStore from "../../stores/useAuthStore";
import useMessageStore from "../../stores/useMessageStore";
import Spinner from "../../components/ui/Spinner";
import SEO from "../../components/ui/SEO";
import { supabase } from "../../lib/supabase";

export default function Messages() {
  const [searchParams] = useSearchParams();
  const sellerQueryId = searchParams.get("seller");
  const { user } = useAuthStore();

  const {
    conversations,
    activeConversation,
    activeMessages,
    loading,
    messagesLoading,
    fetchConversations,
    fetchMessagesWithPeer,
    sendMessage,
    setActiveConversation,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useMessageStore();

  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
      subscribeToMessages(user.id);
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [user?.id]);

  // Handle direct query from ListingDetail (e.g. ?seller=uuid)
  useEffect(() => {
    if (sellerQueryId && user?.id && sellerQueryId !== user.id) {
      supabase
        .from("profiles")
        .select("id, username, avatar_url, verified_seller")
        .eq("id", sellerQueryId)
        .single()
        .then(({ data }) => {
          if (data) {
            setActiveConversation(data);
            fetchMessagesWithPeer(user.id, data.id);
          }
        });
    }
  }, [sellerQueryId, user?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSelectPeer = (peer) => {
    setActiveConversation(peer);
    fetchMessagesWithPeer(user.id, peer.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation || !user) return;
    const textToSend = messageText;
    setMessageText("");

    await sendMessage({
      senderId: user.id,
      receiverId: activeConversation.id,
      content: textToSend,
    });
  };

  const filteredConversations = conversations.filter((c) =>
    c.peer?.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <SEO title="Messages | Arcane Bazaar" />
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-extrabold text-white">
          Messages
        </h1>

        <div className="bg-[#18171E] border border-[#2A2932] rounded-2xl h-[calc(100vh-220px)] min-h-[500px] flex overflow-hidden shadow-2xl">
          {/* ================= LEFT COLUMN: CONVERSATION LIST ================= */}
          <div className="w-full sm:w-80 border-r border-[#2A2932] flex flex-col bg-[#141319]/60">
            {/* Search Input */}
            <div className="p-3 border-b border-[#2A2932]">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-[#18171E] border border-[#2A2932] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-500 outline-none focus:border-arcane-gold/50"
                />
              </div>
            </div>

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Spinner size="md" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  No conversations found
                </div>
              ) : (
                filteredConversations.map(
                  ({ peer, lastMessage, unreadCount }) => {
                    const isSelected = activeConversation?.id === peer.id;
                    return (
                      <button
                        key={peer.id}
                        onClick={() => handleSelectPeer(peer)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-arcane-gold/15 border border-arcane-gold/30"
                            : "hover:bg-[#1E1D24] border border-transparent"
                        }`}
                      >
                        <div className="relative w-10 h-10 rounded-full bg-[#1E1D24] flex items-center justify-center font-bold text-arcane-gold flex-shrink-0 overflow-hidden">
                          {peer.avatar_url ? (
                            <img
                              src={peer.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            peer.username?.charAt(0).toUpperCase() || "U"
                          )}
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#18171E]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white truncate">
                              {peer.username}
                            </span>
                            {lastMessage?.created_at && (
                              <span className="text-[10px] text-gray-500">
                                {new Date(
                                  lastMessage.created_at,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted truncate mt-0.5">
                            {lastMessage?.content || "Start conversation"}
                          </p>
                        </div>

                        {unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-arcane-gold text-[#141319] text-[10px] flex items-center justify-center font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  },
                )
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ACTIVE CHAT ================= */}
          <div className="hidden sm:flex flex-1 flex-col bg-[#18171E]">
            {activeConversation ? (
              <>
                {/* Active Header */}
                <div className="p-3.5 border-b border-[#2A2932] flex items-center justify-between bg-[#141319]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E1D24] flex items-center justify-center font-bold text-arcane-gold overflow-hidden">
                      {activeConversation.avatar_url ? (
                        <img
                          src={activeConversation.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeConversation.username?.charAt(0).toUpperCase() ||
                        "U"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {activeConversation.username}
                        </span>
                        {activeConversation.verified_seller && (
                          <HiOutlineShieldCheck
                            className="w-4 h-4 text-blue-400"
                            title="Verified Merchant"
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ● Online (TradeShield Active)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="py-12 flex justify-center">
                      <Spinner size="md" />
                    </div>
                  ) : activeMessages.length === 0 ? (
                    <div className="py-20 text-center text-text-muted text-xs">
                      Send a message to start trading safely.
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                              isMe
                                ? "bg-arcane-gold text-[#141319] font-medium rounded-tr-none"
                                : "bg-[#1E1D24] border border-[#2A2932] text-white rounded-tl-none"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <span
                              className={`block text-[9px] mt-1 text-right ${
                                isMe ? "text-[#141319]/70" : "text-gray-400"
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-[#2A2932] bg-[#141319]/50 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-[#18171E] border border-[#2A2932] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none focus:border-arcane-gold/50"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-2.5 bg-arcane-gold hover:bg-arcane-gold/90 disabled:opacity-40 text-[#141319] font-bold rounded-xl transition-all shadow-md"
                  >
                    <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
                <div className="w-16 h-16 rounded-2xl bg-[#1E1D24] flex items-center justify-center mb-3 text-arcane-gold">
                  <HiOutlineChat className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Your Trade Messages
                </h3>
                <p className="text-xs max-w-sm">
                  Select a chat from the sidebar or click "Chat Seller" on any
                  listing to start a conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
