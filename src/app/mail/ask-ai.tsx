import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Send, SparklesIcon, Loader2 } from "lucide-react";
import { useChat } from "ai/react";
import useThreads from "@/hooks/use-threads";

const AskAi = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { accountId } = useThreads();
  const { input, handleInputChange, handleSubmit, messages, isLoading, error } =
    useChat({
      api: "/api/chat",
      body: {
        accountId,
      },
      onResponse: async (response) => {
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let result = "";

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            result += decoder.decode(value, { stream: !done });
          }

          const parsedResponse = JSON.parse(result);

          console.log("AI response:", parsedResponse);
          if (!parsedResponse.role || !parsedResponse.content) {
            console.error("Error in chat response format.");
          }
        }
      },
      onFinish: (message) => {
        console.log("Chat response completed:", message);
      },
      onError: (error) => {
        console.error("Failed to fetch chat messages", error);
      },
    });

  if (isCollapsed) return null;

  React.useEffect(() => {
    if (messages.length > 0) {
      console.log("Current messages:", messages);
    }
  }, [messages]);

  const suggestions = [
    "What can I ask?",
    "When is my next flight?",
    "When is my next meeting?",
    "Show my unread emails",
    "Find important emails from last week",
  ];

  const renderMessage = (message: any) => {
    return (
      <motion.div
        layout="position"
        key={message.id}
        className={cn(
          "group relative mb-2 max-w-[85%] break-words rounded-xl px-3 py-2 text-sm",
          {
            "ml-auto bg-blue-500 text-white": message.role === "user",
            "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100":
              message.role === "assistant",
          },
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <motion.div
          className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100"
          initial={false}
        >
          <time className="px-2 py-1 text-xs text-gray-400">
            {new Date().toLocaleTimeString()}
          </time>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-220px)] w-full flex-col bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex items-center gap-2 px-4 py-3 text-sm">
        <SparklesIcon className="size-4 text-blue-500" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          AI Assistant
        </span>
      </div>
      <p className="px-4 pb-3 text-xs text-gray-500">
        Ask me anything about your emails
      </p>

      <div className="flex-1 overflow-y-auto px-4">
        <AnimatePresence mode="wait">
          {messages.map(renderMessage)}
        </AnimatePresence>

        {messages.length === 0 && (
          <motion.div
            className="flex flex-col items-center gap-3 py-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
              <SparklesIcon className="size-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                How can I help you today?
              </h4>
              <p className="text-sm text-gray-500">
                Try asking about your emails, meetings, or travel plans
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() =>
                    handleInputChange({
                      target: { value: suggestion },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="w-full rounded-lg bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-transparent p-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full rounded-full border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
            />
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="size-4 animate-spin text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex size-9 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:hover:bg-gray-300 dark:disabled:bg-gray-700"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AskAi;
