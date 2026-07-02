"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { API_URL } from "@/helpers/apiUrl";

const STORAGE_SESSION_KEY  = "pilot_bazar_chat_session";
const STORAGE_MESSAGES_KEY = "pilot_bazar_chat_messages";
const STORAGE_WELCOMED_KEY = "pilot_bazar_chat_welcomed";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "bot",
  text: "আস্সালামু আলাইকুম! আমি Sidratul Muntaha, Pilot Bazar-এর কাস্টমার সার্ভিস থেকে বলছি। 😊\n\nআপনি কি গাড়ি কিনতে আগ্রহী?",
  options: ["হ্যাঁ, কিনতে চাই", "না, শুধু দেখছি"],
  timestamp: new Date().toISOString(),
};

function generateSessionId() {
  return "chat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 15);
}

function TypingDots() {
  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-[#0167a1] flex items-center justify-center shrink-0 text-white text-xs font-bold">
        SM
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

function QuickReplies({ options, onSelect, disabled }) {
  if (!options || !options.length) return null;
  return (
    <div className="flex flex-wrap gap-2 pl-10 mt-1">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(opt)}
          disabled={disabled}
          className="text-[12px] text-[#0167a1] border border-[#0167a1]/50 bg-white hover:bg-[#0167a1] hover:text-white px-3 py-1.5 rounded-full transition-all duration-150 disabled:opacity-40 leading-snug"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [visible, setVisible]     = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Options are derived from the last bot message — no separate state needed
  const lastBotMsg = [...messages].reverse().find((m) => m.role === "bot");
  const activeOptions = (!isLoading && lastBotMsg?.options?.length) ? lastBotMsg.options : [];

  useEffect(() => {
    let sid = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sid) {
      sid = generateSessionId();
      localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    setSessionId(sid);
    try {
      const saved = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch (_) {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 200);
    } else {
      setTimeout(() => setVisible(false), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const persistMessages = useCallback((msgs) => {
    const trimmed = msgs.slice(-30);
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(trimmed));
    return trimmed;
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const opening = !prev;
      if (opening && !localStorage.getItem(STORAGE_WELCOMED_KEY)) {
        const initial = [WELCOME_MESSAGE];
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(initial));
        localStorage.setItem(STORAGE_WELCOMED_KEY, "1");
        setMessages(initial);
      }
      return opening;
    });
  }, []);

  const handleBotReply = useCallback(async (text, opts, currentMessages) => {
    const typingDelay = Math.min(Math.max((text || "").length * 18, 1500), 4000);
    await new Promise((r) => setTimeout(r, typingDelay));
    const botMsg = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: text || "",
      options: opts || [],
      timestamp: new Date().toISOString(),
    };
    setMessages(persistMessages([...currentMessages, botMsg]));
  }, [persistMessages]);

  const sendText = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = persistMessages([...messages, userMsg]);
    setMessages(updated);
    setInputText("");
    setIsLoading(true);

    const history = updated
      .filter((m) => m.id !== "welcome")
      .slice(0, -1)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

    try {
      const res  = await fetch(`${API_URL}api/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          session_id: sessionId,
          conversation_history: history,
          source_page: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        await handleBotReply(data.message, data.options, updated);
      } else {
        throw new Error("error");
      }
    } catch (_) {
      await new Promise((r) => setTimeout(r, 1500));
      await handleBotReply("দুঃখিত, এখন সংযোগ সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।", [], updated);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, sessionId, persistMessages, handleBotReply]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText(inputText);
    }
  };

  return (
    <>
      {visible && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-200 ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-[#0167a1] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                SM
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0167a1] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm leading-tight">Sidratul Muntaha</p>
              <p className="text-[11px] text-white/70 mt-0.5">Click4Details · Customer Service</p>
            </div>
            <button
              onClick={toggleChat}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, idx) => {
              const isLastMsg = idx === messages.length - 1;
              return msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[78%] bg-[#0167a1] text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-none shadow-sm leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex flex-col gap-2">
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0167a1] flex items-center justify-center shrink-0 text-white text-xs font-bold">
                      SM
                    </div>
                    <div className="max-w-[78%] bg-white border border-gray-100 shadow-sm text-gray-800 text-sm px-4 py-2.5 rounded-2xl rounded-bl-none leading-relaxed whitespace-pre-line">
                      {msg.text}
                    </div>
                  </div>
                  {isLastMsg && activeOptions.length > 0 && (
                    <QuickReplies
                      options={activeOptions}
                      onSelect={sendText}
                      disabled={isLoading}
                    />
                  )}
                </div>
              );
            })}

            {isLoading && <TypingDots />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="এখানে লিখুন..."
              disabled={isLoading}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0167a1]/30 disabled:opacity-50 transition"
            />
            <button
              onClick={() => sendText(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="w-10 h-10 bg-[#0167a1] hover:bg-[#015a8c] text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-colors shrink-0 shadow"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0167a1] hover:bg-[#015a8c] text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200"
        aria-label="Chat with us"
      >
        <div className={`absolute transition-all duration-200 ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
          <X size={22} />
        </div>
        <div className={`absolute transition-all duration-200 ${isOpen ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
          <MessageCircle size={22} />
        </div>
      </button>
    </>
  );
}
