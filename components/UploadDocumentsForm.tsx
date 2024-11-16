"use client";

import { useState, type FormEvent } from "react";
import DEFAULT_RETRIEVAL_TEXT from "@/data/DefaultRetrievalText";

export function UploadDocumentsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [document, setDocument] = useState(DEFAULT_RETRIEVAL_TEXT);
  const ingest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/retrieval/ingest", {
      method: "POST",
      body: JSON.stringify({
        text: document,
      }),
    });
    if (response.status === 200) {
      setDocument("Uploaded!");
    } else {
      const json = await response.json();
      if (json.error) {
        setDocument(json.error);
      }
    }
    setIsLoading(false);
  };
  return (
    <form onSubmit={ingest} className="flex flex-col gap-4">
      <textarea
        className="w-full h-48 p-4 bg-[#40414f] text-white rounded-lg resize-none focus:outline-none"
        value={document}
        onChange={(e) => setDocument(e.target.value)}
        placeholder="Paste your document text here..."
      />
      <button
        type="submit"
        className="px-4 py-2 bg-[#19c37d] hover:bg-[#1a8870] rounded-lg w-full flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <div role="status" className="flex items-center">
            <svg className="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24">
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
            Processing...
          </div>
        ) : (
          "Upload Document"
        )}
      </button>
    </form>
  );
}
