import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChat,
  HiOutlineX,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineArrowLeft,
  HiOutlineSearch,
} from "react-icons/hi";
import useSupportAgentStore from "../../stores/useSupportAgentStore";
import useAuthStore from "../../stores/useAuthStore";

const quickQuestions = [
  "What payment methods do you accept?",
  "How do refunds work?",
  "How long does delivery take?",
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
  { title: "Seller Withdrawals", href: "/help/article/seller-withdrawals" },
  { title: "Account Security Guide", href: "/help/article/account-security" },
  { title: "Buyer Protection", href: "/help/article/tradeshield-protection" },
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
  const [articleSearch, setArticleSearch] = useState("");
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

  const filteredArticles = helpArticles.filter((a) =>
    a.title.toLowerCase().includes(articleSearch.toLowerCase()),
  );

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-5 right-5 z-[999] w-16 h-16 flex items-center justify-center"
      >
        {isOpen ? (
          <div className="w-14 h-14 rounded-full bg-arcane-elevated border border-arcane-border flex items-center justify-center shadow-2xl">
            <HiOutlineX className="w-6 h-6 text-white" />
          </div>
        ) : (
          <img
            src="/arcane-agent.png"
            alt="Support"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </motion.button>

      {/* Support Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleChat}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed z-[999] flex flex-col bg-arcane-elevated border border-arcane-border overflow-hidden
                bottom-24 right-5 w-[calc(100vw-40px)] max-w-[380px] h-[400px]
                sm:w-[400px] sm:h-[450px]
                rounded-3xl shadow-2xl"
            >
              {/* Header - Brand */}
              <div className="bg-arcane-elevated border-b border-arcane-border p-4 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                  <img
                    src="/arcane-agent.png"
                    alt="Arcane Bazaar Agent"
                    className="w-10 h-10 object-contain bot-icon-purple"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">
                    Arcane Bazaar
                  </h3>
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />{" "}
                    Support Agent
                  </p>
                </div>
                <button
                  onClick={() => {
                    clearChat();
                    toggleChat();
                  }}
                  className="p-2 text-text-muted hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {view === "home" && (
                  <div className="p-4 space-y-5">
                    {/* Search Articles */}
                    <div>
                      <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="text"
                          value={articleSearch}
                          onChange={(e) => setArticleSearch(e.target.value)}
                          placeholder="Search for help"
                          className="w-full bg-white/5 border border-arcane-border rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-text-muted outline-none focus:border-arcane-purple/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Articles (filtered) */}
                    {articleSearch && (
                      <div>
                        <div className="space-y-1">
                          {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                              <Link
                                key={article.title}
                                to={article.href}
                                onClick={toggleChat}
                                className="block p-3 rounded-xl hover:bg-white/5 text-sm text-white/80 hover:text-white transition-all"
                              >
                                {article.title}
                              </Link>
                            ))
                          ) : (
                            <p className="text-text-muted text-sm text-center py-4">
                              No articles found
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Start */}
                    {!articleSearch && (
                      <>
                        <button
                          onClick={() => setView("chat")}
                          className="w-full p-4 rounded-2xl bg-gradient-to-r from-arcane-purple/20 to-arcane-gold/10 border border-arcane-purple/20 hover:border-arcane-purple/40 transition-all text-left"
                        >
                          <p className="text-white font-medium text-sm">
                            💬 Start a conversation
                          </p>
                          <p className="text-text-muted text-xs mt-1">
                            Chat with our AI support agent
                          </p>
                        </button>

                        {messages.length > 0 && (
                          <div>
                            <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">
                              Recent Messages
                            </h4>
                            <button
                              onClick={() => setView("chat")}
                              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left"
                            >
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arcane-purple to-arcane-gold flex items-center justify-center">
                                <HiOutlineSparkles className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-white text-sm">
                                  Arcane Bazaar Bot
                                </p>
                                <p className="text-text-muted text-xs">
                                  Tap to continue conversation
                                </p>
                              </div>
                            </button>
                          </div>
                        )}

                        {/* Popular Articles */}
                        <div>
                          <h4 className="text-xs text-text-muted uppercase tracking-wider mb-2">
                            Popular Help
                          </h4>
                          <div className="space-y-1">
                            {helpArticles.slice(0, 4).map((article) => (
                              <Link
                                key={article.title}
                                to={article.href}
                                onClick={toggleChat}
                                className="block p-3 rounded-xl hover:bg-white/5 text-sm text-white/80 hover:text-white transition-all"
                              >
                                {article.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {view === "chat" && (
                  <div className="flex flex-col h-full">
                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-3">
                      {messages.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="flex justify-center mb-3">
                            <img
                              src="/arcane-agent.png"
                              alt=""
                              className="w-12 h-12 object-contain bot-icon-purple"
                            />
                          </div>
                          <p className="text-white font-medium text-sm">
                            How can we help?
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center mt-4">
                            {quickQuestions.map((q) => (
                              <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/70 rounded-full transition-all"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        messages.map((msg) => (
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
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}

                      {sending && (
                        <div className="flex justify-start">
                          <div className="px-4 py-2.5 rounded-2xl bg-white/10">
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
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (input.trim()) {
                          sendMessage(input);
                          setInput("");
                        }
                      }}
                      className="p-3 border-t border-arcane-border flex gap-2 flex-shrink-0 bg-arcane-elevated"
                    >
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending}
                        className="flex-1 bg-white/5 border border-arcane-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-arcane-purple/50 disabled:opacity-50 min-w-0"
                      />
                      <button
                        type="submit"
                        disabled={sending || !input.trim()}
                        className="p-2.5 bg-arcane-purple text-white rounded-xl hover:bg-arcane-purple-hover transition-all disabled:opacity-50 flex-shrink-0"
                      >
                        <HiOutlinePaperAirplane className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
