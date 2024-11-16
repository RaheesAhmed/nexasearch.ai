import type { Message } from "ai/react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: any[];
}) {
  const isUser = props.message.role === "user";
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`py-5 ${isUser ? "bg-transparent" : "bg-[#444654]"}`}>
      <div className="max-w-4xl mx-auto flex gap-6 px-4">
        <div className="min-w-[2rem] h-8 rounded-sm flex items-center justify-center shrink-0">
          {isUser ? "👤" : props.aiEmoji}
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                pre: ({ node, ...props }) => (
                  <div className="overflow-auto w-full my-2 bg-[#2A2B32] p-4 rounded-lg">
                    <pre {...props} />
                  </div>
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code className="bg-[#2A2B32] px-1 rounded" {...props} />
                  ) : (
                    <code {...props} />
                  ),
              }}
            >
              {props.message.content}
            </ReactMarkdown>
          </div>

          {props.sources && props.sources.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showSources ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                {`${props.sources.length} source${
                  props.sources.length > 1 ? "s" : ""
                }`}
              </button>

              {showSources && (
                <div className="mt-2 text-sm text-gray-300 bg-[#2A2B32] p-4 rounded-lg space-y-4">
                  {props.sources?.map((source, i) => (
                    <div
                      className="border-b last:border-0 border-gray-700 pb-4 last:pb-0"
                      key={"source:" + i}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">#{i + 1}</span>
                        <span className="text-xs px-2 py-1 bg-gray-800 rounded-full">
                          {source.metadata?.loc?.lines
                            ? `Lines ${source.metadata.loc.lines.from}-${source.metadata.loc.lines.to}`
                            : "No line info"}
                        </span>
                      </div>
                      <div className="mt-2 text-gray-300">
                        &quot;{source.pageContent}&quot;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
