import { useState, useRef, useEffect } from "react";
import { useEmailAgent, ChatMessage } from "@/hooks/useEmailAgent";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Bot, ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";

const EXAMPLE_QUERIES = [
  "What brands replied in the past two weeks I need to follow up with?",
  "Summarize all updates this week",
  "Which deals are stalled with no recent activity?",
];

export function EmailAgentChat() {
  const { messages, isLoading, sendQuery, clearChat } = useEmailAgent();
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    sendQuery(trimmed);
  };

  const handleChip = (q: string) => {
    if (isLoading) return;
    setInput("");
    sendQuery(q);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card rounded-xl border border-border mb-8">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-xl">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-sans font-semibold text-primary">
                AI Assistant
              </span>
              <span className="text-xs text-muted-foreground font-sans">
                Ask about your emails, Slack, &amp; deals
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Messages */}
            {messages.length > 0 && (
              <div
                ref={scrollRef}
                className="max-h-[400px] overflow-y-auto space-y-3 pr-1"
              >
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                {isLoading &&
                  messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-2 items-center text-sm text-muted-foreground font-sans">
                      <Bot className="w-4 h-4 animate-pulse" />
                      Thinking…
                    </div>
                  )}
              </div>
            )}

            {/* Example chips when empty */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleChip(q)}
                    className="text-xs font-sans px-3 py-1.5 rounded-full border border-border hover:bg-muted/50 text-muted-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your emails, deals, or Slack messages…"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="gap-1 font-sans"
              >
                <Send className="w-4 h-4" />
              </Button>
              {messages.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="gap-1 font-sans"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </form>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm font-sans ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
