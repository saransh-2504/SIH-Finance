"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mic, Send } from "lucide-react";
import { aiApi, type ChatResponse } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SUGGESTED_QUESTIONS = [
  "Why did I get this feasibility score?",
  "Should I reduce my loan amount?",
  "What are my biggest risks?",
  "How can I improve my operating margin?",
  "Which business is safer for my capital?",
  "Explain my loan in simple Hindi.",
  "What should I do before borrowing?",
  "Is my repayment coverage sufficient?",
];

interface Message {
  role: "user" | "advisor";
  text: string;
  confidence?: string;
  sources?: string[];
}

function AdvisorContent() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessment") ?? undefined;
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "advisor",
      text: "Hello! I'm your business advisor. Ask me anything about your assessment, financial model, market analysis, or loan options. I'll answer using your actual data and deterministic financial rules — not guesses.",
      confidence: "high",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendQuestion(q: string) {
    if (!q.trim()) return;
    const userMsg: Message = { role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res: ChatResponse = await aiApi.chat({
        question: q,
        assessment_id: assessmentId,
        language,
      });
      setMessages((m) => [
        ...m,
        {
          role: "advisor",
          text: res.answer,
          confidence: res.confidence,
          sources: res.sources,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "advisor",
          text: "Business insights are temporarily unavailable. Your financial calculations are still available in the Finance section.",
          confidence: "low",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Business Advisor</h1>
          <p className="text-sm text-[#66715f] mt-1">
            Grounded answers using your assessment data and deterministic financial rules.
          </p>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="h-9 rounded-md border border-input bg-white px-3 text-sm"
          aria-label="Response language"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Suggested questions */}
        <Card className="border-[#d8d1bd] h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendQuestion(q)}
                disabled={loading}
                className="w-full text-left rounded-xl border border-[#e5e7eb] bg-white px-3 py-2.5 text-xs text-[#374151] hover:border-[#166534] hover:bg-[#f0fdf4] transition-colors"
              >
                {q}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat */}
        <div className="flex flex-col gap-4">
          <Card className="border-[#d8d1bd] flex-1">
            <CardContent className="p-4">
              <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto pr-1">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`size-7 shrink-0 rounded-full grid place-items-center text-xs font-bold ${
                        m.role === "advisor" ? "bg-[#0f2d1c] text-white" : "bg-[#d97706] text-white"
                      }`}
                    >
                      {m.role === "advisor" ? "A" : "U"}
                    </div>
                    <div className={`flex-1 rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === "advisor" ? "bg-[#f8f7f2] text-[#1f2937]" : "bg-[#0f2d1c] text-white"
                    }`}>
                      {m.text}
                      {m.role === "advisor" && m.confidence && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              m.confidence === "high" ? "border-[#166534] text-[#166534]" :
                              m.confidence === "medium" ? "border-[#d97706] text-[#d97706]" :
                              "border-[#dc2626] text-[#dc2626]"
                            }`}
                          >
                            {m.confidence === "high" ? "🟢" : m.confidence === "medium" ? "🟡" : "🔴"} {m.confidence} confidence
                          </Badge>
                          {m.sources?.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] text-[#9ca3af]">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="size-7 shrink-0 rounded-full bg-[#0f2d1c] text-white grid place-items-center text-xs font-bold">A</div>
                    <div className="flex-1 rounded-2xl bg-[#f8f7f2] p-4 flex items-center gap-2 text-sm text-[#9ca3af]">
                      <Loader2 className="size-4 animate-spin" /> Thinking…
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about your assessment, financial model, risks, schemes…"
              className="resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendQuestion(question);
                }
              }}
            />
            <Button
              className="bg-[#166534] hover:bg-[#14532d] self-end"
              onClick={() => sendQuestion(question)}
              disabled={loading || !question.trim()}
              aria-label="Send question"
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-[#9ca3af]">
            AI responses are for informational guidance only. Financial calculations use deterministic rules.
            This is not financial, legal, or government advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[#e8e4dc]" />}>
          <AdvisorContent />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}
