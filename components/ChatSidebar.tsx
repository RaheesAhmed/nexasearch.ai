import { Message } from "ai";
import { useState, useEffect } from "react";

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatSidebarProps {
  currentChat: Message[];
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  currentChat,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    // Load chats from localStorage on component mount
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  useEffect(() => {
    // Save current chat if it has messages
    if (currentChat.length > 0) {
      const firstMessage = currentChat[0];
      const title =
        firstMessage.role === "user"
          ? firstMessage.content.slice(0, 30) +
            (firstMessage.content.length > 30 ? "..." : "")
          : "New Chat";

      // Check if we're updating an existing chat or creating a new one
      if (selectedChatId) {
        // Update existing chat
        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, messages: currentChat }
              : chat,
          );
          localStorage.setItem("chats", JSON.stringify(updatedChats));
          return updatedChats;
        });
      } else {
        // Create new chat
        const newChat: Chat = {
          id: Date.now().toString(),
          title,
          messages: currentChat,
          createdAt: new Date(),
        };

        setChats((prevChats) => {
          const updatedChats = [...prevChats, newChat];
          localStorage.setItem("chats", JSON.stringify(updatedChats));
          return updatedChats;
        });
        setSelectedChatId(newChat.id);
      }
    }
  }, [currentChat, selectedChatId]);

  const handleNewChat = () => {
    setSelectedChatId(null);
    onNewChat();
  };

  return (
    <div className="w-64 bg-[#202123] h-full flex flex-col">
      <button
        onClick={handleNewChat}
        className="flex items-center gap-3 p-3 text-sm text-white hover:bg-gray-700 transition-colors m-2 rounded-lg border border-gray-600"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        New Chat
      </button>

      <div className="flex-1 overflow-auto">
        {chats
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChatId(chat.id);
                onSelectChat(chat);
              }}
              className={`p-3 text-sm cursor-pointer hover:bg-gray-700 transition-colors ${
                selectedChatId === chat.id ? "bg-gray-700" : ""
              }`}
            >
              <div className="text-gray-100 truncate">{chat.title}</div>
              <div className="text-xs text-gray-400">
                {new Date(chat.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
