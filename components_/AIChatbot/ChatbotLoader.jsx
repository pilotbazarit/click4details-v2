"use client";

import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(
  () => import("@/components/AIChatbot/ChatbotWidget"),
  { ssr: false, loading: () => null }
);

export default function ChatbotLoader() {
  return <ChatbotWidget />;
}
