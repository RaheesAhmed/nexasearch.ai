import { ChatWindow } from "@/components/ChatWindow";

export default function RetrievalPage() {
  const InfoCard = (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="flex flex-col items-center justify-center max-w-[920px]">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Document Q&A Assistant
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
          {/* Examples Section */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium mb-3 text-center">Examples</h2>
            <button className="text-left bg-[#3E3F4B] p-3 rounded-md hover:bg-gray-700 transition-colors text-sm">
              "What is a document loader?" →
            </button>
            <button className="text-left bg-[#3E3F4B] p-3 rounded-md hover:bg-gray-700 transition-colors text-sm">
              "How can I use vector stores?" →
            </button>
            <button className="text-left bg-[#3E3F4B] p-3 rounded-md hover:bg-gray-700 transition-colors text-sm">
              "Explain the retrieval process" →
            </button>
          </div>

          {/* Capabilities Section */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium mb-3 text-center">
              Capabilities
            </h2>
            <div className="text-left bg-[#3E3F4B] p-3 rounded-md text-sm">
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="text-gray-400">•</span>
                  <span>Remembers context from earlier in conversations</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-gray-400">•</span>
                  <span>Allows you to query your documents</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-gray-400">•</span>
                  <span>Provides source references for answers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Limitations Section */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium mb-3 text-center">
              Limitations
            </h2>
            <div className="text-left bg-[#3E3F4B] p-3 rounded-md text-sm">
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="text-gray-400">•</span>
                  <span>May occasionally generate incorrect information</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-gray-400">•</span>
                  <span>Limited to knowledge from uploaded documents</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-gray-400">•</span>
                  <span>Cannot access external information</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 w-full h-[calc(100vh-65px)] bg-[#343541]">
      <ChatWindow
        endpoint="api/chat/retrieval"
        emptyStateComponent={InfoCard}
        placeholder="Send a message..."
        titleText="Document Q&A"
        emoji="📚"
      />
    </div>
  );
}
