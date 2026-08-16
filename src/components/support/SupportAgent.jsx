import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChat,
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineHome,
  HiOutlineQuestionMarkCircle,
  HiOutlineMail,
  HiOutlineArrowLeft,
  HiOutlineCheck,
} from "react-icons/hi";
import useSupportAgentStore from "../../stores/useSupportAgentStore";
import useAuthStore from "../../stores/useAuthStore";

const quickQuestions = [
  { q: "What payment methods do you accept?", icon: "💳" },
  { q: "How do refunds work?", icon: "💰" },
  { q: "Is buying accounts safe?", icon: "🛡️" },
  { q: "How long does delivery take?", icon: "⚡" },
  { q: "How do I become a seller?", icon: "🏪" },
];

const helpArticles = [
  {
    title: "What is the process of order Dispute?",
    href: "/help/article/dispute-resolution",
  },
  {
    title: "Refund & Return Policy",
    href: "/help/article/refund-return-policy",
  },
  {
    title: "Payment Methods & Fees",
    href: "/help/article/payment-methods-fees",
  },
  { title: "Seller Rules", href: "/help/article/seller-rules" },
  { title: "Account Security Guide", href: "/help/article/account-security" },
];

export default function SupportAgent() {
  const {
    messages,
    sending,
    isOpen,
    toggleChat,
    sendMessage,
    clearChat,
    view,
    setView,
    loadChatHistory,
    saveChatHistory,
    ratedMessages,
    rateMessage,
  } = useSupportAgentStore();
  const { profile } = useAuthStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    saveChatHistory();
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleQuickQuestion = (q) => {
    sendMessage(q);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-5 right-5 z-[999] w-14 h-14 rounded-full bg-gradient-to-br from-arcane-purple to-arcane-gold flex items-center justify-center shadow-2xl shadow-arcane-purple/30 hover:shadow-arcane-gold/30 transition-shadow"
      >
        {isOpen ? (
          <HiOutlineX className="w-6 h-6 text-white" />
        ) : (
          <HiOutlineSparkles className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Support Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-[999] w-[380px] sm:w-[420px] max-h-[600px] bg-arcane-elevated border border-arcane-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-arcane-purple to-arcane-gold p-5">
              <div className="flex items-center gap-3">
                {view !== "home" && (
                  <button
                    onClick={() => setView("home")}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <HiOutlineSparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">
                    Hi {profile?.username || "there"} 💛
                  </h3>
                  <p className="text-white/70 text-xs">How can we help?</p>
                </div>
                <button
                  onClick={() => {
                    clearChat();
                    toggleChat();
                  }}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {view === "home" && (
                <div className="p-4 space-y-4">
                  {/* Quick Questions */}
                  <div>
                    <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">
                      Quick Questions
                    </h4>
                    <div className="space-y-1.5">
                      {quickQuestions.map((item) => (
                        <button
                          key={item.q}
                          onClick={() => handleQuickQuestion(item.q)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-left text-sm"
                        >
                          <span>{item.icon}</span>
                          <span className="flex-1">{item.q}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Help Articles */}
                  <div>
                    <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">
                      Help Articles
                    </h4>
                    <div className="space-y-1.5">
                      {helpArticles.map((article) => (
                        <Link
                          key={article.title}
                          to={article.href}
                          onClick={() => toggleChat()}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-left text-sm"
                        >
                          <HiOutlineQuestionMarkCircle className="w-4 h-4 text-arcane-purple flex-shrink-0" />
                          <span>{article.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Links */}
                  <div className="pt-2 border-t border-arcane-border flex justify-center gap-4 text-xs">
                    <Link
                      to="/"
                      onClick={() => toggleChat()}
                      className="flex items-center gap-1 text-text-muted hover:text-white transition-colors"
                    >
                      <HiOutlineHome className="w-3 h-3" /> Home
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => toggleChat()}
                      className="flex items-center gap-1 text-text-muted hover:text-white transition-colors"
                    >
                      <HiOutlineQuestionMarkCircle className="w-3 h-3" /> Help
                    </Link>
                    <button
                      onClick={() => setView("chat")}
                      className="flex items-center gap-1 text-text-muted hover:text-white transition-colors"
                    >
                      <HiOutlineChat className="w-3 h-3" /> Messages
                    </button>
                  </div>
                </div>
              )}

              {view === "chat" && (
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="p-4 space-y-3 min-h-[300px]">
                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <HiOutlineSparkles className="w-12 h-12 text-arcane-purple/30 mx-auto mb-3" />
                        <p className="text-white font-medium text-sm">
                          Ask me anything about Arcane Bazaar
                        </p>
                        <p className="text-text-muted text-xs mt-1">
                          I'm here to help 24/7
                        </p>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                            msg.role === "user"
                              ? "bg-arcane-purple text-white rounded-br-md"
                              : msg.isError
                                ? "bg-red-500/20 text-red-300 rounded-bl-md"
                                : "bg-white/10 text-white rounded-bl-md"
                          }`}
                        >
                          <p>{msg.content}</p>

                          {msg.needsHuman && (
                            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                              <p className="text-xs text-amber-400 flex items-center gap-1">
                                <HiOutlineShieldCheck className="w-3 h-3" />{" "}
                                Escalated to human support
                              </p>
                              {msg.priority && (
                                <p className="text-[10px] text-amber-400/60 mt-0.5">
                                  Priority: {msg.priority}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Rating */}
                          {msg.role === "agent" &&
                            !msg.isError &&
                            !ratedMessages[msg.id] && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => rateMessage(msg.id, "helpful")}
                                  className="px-2 py-1 text-xs bg-white/5 hover:bg-green-500/10 text-white/50 hover:text-green-400 rounded-full transition-all"
                                >
                                  👍
                                </button>
                                <button
                                  onClick={() =>
                                    rateMessage(msg.id, "not_helpful")
                                  }
                                  className="px-2 py-1 text-xs bg-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-400 rounded-full transition-all"
                                >
                                  👎
                                </button>
                              </div>
                            )}
                          {ratedMessages[msg.id] && (
                            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                              <HiOutlineCheck className="w-3 h-3 text-green-400" />{" "}
                              Thanks for your feedback!
                            </p>
                          )}
                        </div>
                      </div>
                    ))}

                    {sending && (
                      <div className="flex justify-start">
                        <div className="px-4 py-2.5 rounded-2xl bg-white/10 rounded-bl-md">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                            <div
                              className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form
                    onSubmit={handleSend}
                    className="p-3 border-t border-arcane-border flex gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sending}
                      className="flex-1 bg-arcane-surface border border-arcane-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-arcane-purple/50 transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      className="p-2.5 bg-arcane-purple text-white rounded-xl hover:bg-arcane-purple-hover transition-all disabled:opacity-50"
                    >
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
