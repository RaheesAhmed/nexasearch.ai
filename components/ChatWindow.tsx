"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Message } from "ai";
import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { IntermediateStep } from "./IntermediateStep";
import { ChatSidebar } from "@/components/ChatSidebar";

export function ChatWindow(props: {
  endpoint: string;
  emptyStateComponent: ReactElement;
  placeholder?: string;
  titleText?: string;
  emoji?: string;
  showIntermediateStepsToggle?: boolean;
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    endpoint,
    emptyStateComponent,
    placeholder,
    titleText = "An LLM",
    showIntermediateStepsToggle,
    emoji,
  } = props;

  const [showIntermediateSteps, setShowIntermediateSteps] = useState(false);
  const [intermediateStepsLoading, setIntermediateStepsLoading] =
    useState(false);

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const [showSidebar, setShowSidebar] = useState(true);

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
    setMessages,
  } = useChat({
    api: endpoint,
    onResponse(response) {
      const sourcesHeader = response.headers.get("x-sources");
      const sources = sourcesHeader
        ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8"))
        : [];
      const messageIndexHeader = response.headers.get("x-message-index");
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    streamMode: "text",
    onError: (e) => {
      toast(e.message, {
        theme: "dark",
      });
    },
  });

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    setSourcesForMessages({});
  };

  const handleSelectChat = (chat: { messages: Message[] }) => {
    setMessages(chat.messages);
    setSourcesForMessages({});
    setInput("");
  };

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading ?? intermediateStepsLoading) {
      return;
    }
    if (!showIntermediateSteps) {
      handleSubmit(e);
      // Some extra work to show intermediate steps properly
    } else {
      setIntermediateStepsLoading(true);
      setInput("");
      const messagesWithUserReply = messages.concat({
        id: messages.length.toString(),
        content: input,
        role: "user",
      });
      setMessages(messagesWithUserReply);
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          messages: messagesWithUserReply,
          show_intermediate_steps: true,
        }),
      });
      const json = await response.json();
      setIntermediateStepsLoading(false);
      if (response.status === 200) {
        const responseMessages: Message[] = json.messages;
        // Represent intermediate steps as system messages for display purposes
        const toolCallMessages = responseMessages.filter(
          (responseMessage: Message) => {
            return (
              (responseMessage.role === "assistant" &&
                !!responseMessage.tool_calls?.length) ||
              responseMessage.role === "tool"
            );
          },
        );
        const intermediateStepMessages = [];
        for (let i = 0; i < toolCallMessages.length; i += 2) {
          const aiMessage = toolCallMessages[i];
          const toolMessage = toolCallMessages[i + 1];
          intermediateStepMessages.push({
            id: (messagesWithUserReply.length + i / 2).toString(),
            role: "system" as const,
            content: JSON.stringify({
              action: aiMessage.tool_calls?.[0],
              observation: toolMessage.content,
            }),
          });
        }
        const newMessages = messagesWithUserReply;
        for (const message of intermediateStepMessages) {
          newMessages.push(message);
          setMessages([...newMessages]);
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 + Math.random() * 1000),
          );
        }
        setMessages([
          ...newMessages,
          {
            id: newMessages.length.toString(),
            content: responseMessages[responseMessages.length - 1].content,
            role: "assistant",
          },
        ]);
      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark",
          });
          throw new Error(json.error);
        }
      }
    }
  }

  return (
    <div className="flex h-full max-w-full mx-auto">
      {showSidebar && (
        <ChatSidebar
          currentChat={messages}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />
      )}

      <div className="flex flex-col flex-1 h-full">
        <div className="border-b border-gray-700 p-4 flex items-center bg-[#343541]">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-700 rounded-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="ml-4 font-medium">
            {messages.length > 0
              ? messages[0].content.slice(0, 30) +
                (messages[0].content.length > 30 ? "..." : "")
              : titleText}
          </div>
        </div>

        <div
          className={`flex flex-col flex-1 ${
            messages.length > 0 ? "bg-[#343541]" : ""
          }`}
        >
          {messages.length === 0 ? emptyStateComponent : ""}

          <div className="flex-1 overflow-auto" ref={messageContainerRef}>
            <div className="flex flex-col w-full max-w-4xl mx-auto px-4">
              {messages.length > 0
                ? [...messages].map((m, i) => {
                    const sourceKey = i.toString();
                    return m.role === "system" ? (
                      <IntermediateStep key={m.id} message={m} />
                    ) : (
                      <ChatMessageBubble
                        key={m.id}
                        message={m}
                        aiEmoji={emoji}
                        sources={sourcesForMessages[sourceKey]}
                      />
                    );
                  })
                : null}
            </div>
          </div>

          <div className="border-t border-gray-700 p-4 bg-[#343541]">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={sendMessage} className="flex flex-col gap-3">
                {showIntermediateStepsToggle && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show_intermediate_steps"
                      name="show_intermediate_steps"
                      checked={showIntermediateSteps}
                      onChange={(e) =>
                        setShowIntermediateSteps(e.target.checked)
                      }
                      className="rounded border-gray-700 bg-gray-800 text-green-500 focus:ring-green-500"
                    />
                    <label
                      htmlFor="show_intermediate_steps"
                      className="text-sm text-gray-300"
                    >
                      Show intermediate steps
                    </label>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 bg-[#40414f] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={input}
                    placeholder={placeholder ?? "Ask a question..."}
                    onChange={handleInputChange}
                  />
                  <button
                    type="submit"
                    className="p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                    disabled={chatEndpointIsLoading || intermediateStepsLoading}
                  >
                    {chatEndpointIsLoading || intermediateStepsLoading ? (
                      <div role="status" className="flex justify-center">
                        <svg
                          className="w-5 h-5 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 11L12 6L17 11M12 18V7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
