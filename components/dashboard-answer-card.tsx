"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Twitter } from "lucide-react";

import { clsx } from "clsx";
import Image from "next/image";

interface BlueskyApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

type Props = {
  id: number;
  question: string;
  askerName: string;
  answered: boolean;
  answer?: string;
  submitAnswer: (id: number, reply: string) => Promise<void>;
};

export default function DashboardAnswerCard({
  id,
  question,
  askerName,
  answered,
  submitAnswer,
  answer,
}: Props) {
  const [reply, setReply] = useState("");
  const [isAnswered, setIsAnswered] = useState(answered);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  const MAX_QUESTION_LENGTH = 140;
  const MAX_ANSWER_LENGTH = 80;

  function truncate(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  }

  const truncatedQuestion = truncate(question, MAX_QUESTION_LENGTH);
  const answerText = isAnswered ? answer ?? reply : reply;
  const truncatedAnswer = truncate(answerText, MAX_ANSWER_LENGTH);

  const tweetText = `Q: ${truncatedQuestion}\n\nA: ${truncatedAnswer}`;

  async function handlePostToBluesky() {
    const text = `Q: ${truncatedQuestion}\n\nA: ${truncatedAnswer}`;
    try {
      const res = await fetch("/api/postToBluesky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, questionId: id }),
      });
      const data = (await res.json()) as { success: boolean };
      if (data.success) toast.success("Posted to Bluesky!");
      else toast.error("Failed to post to Bluesky");
    } catch {
      toast.error("Failed to post to Bluesky");
    }
  }

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await submitAnswer(id, reply);
        setIsAnswered(true);
        toast.success("Answer submitted");
      } catch {
        toast.error("Failed to submit");
      }
    });
  };

  return (
    <div
      className={clsx(
        "bg-card border rounded-xl p-4 space-y-3 hover:shadow transition cursor-pointer font-sans",
        isAnswered
          ? "border-green-500 bg-green-50 dark:bg-green-900/10"
          : "border-gray-300"
      )}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{askerName}</span>
      </div>

      <p
        className="text-sm whitespace-pre-wrap break-words overflow-hidden"
        dir="auto"
      >
        {question}
      </p>

      <div
        className={clsx(
          "transition-all duration-300 overflow-hidden",
          expanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        )}
        onClick={(e) => e.stopPropagation()} //read more on this
      >
        <div className="bg-accent  p-3 rounded-md">
          {!isAnswered && (
            <>
              <Textarea
                dir="auto"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="mb-2 resize-none"
                placeholder="Write your reply..."
              />
              <Button onClick={handleSubmit} disabled={pending || isAnswered}>
                {pending ? "Submitting..." : "Submit"}
              </Button>
            </>
          )}
          {isAnswered && (
            <div className="flex justify-between">
              <div className="max-w-sm">
                <p
                  className="text-sm whitespace-pre-wrap break-words overflow-hidden"
                  dir="auto"
                >
                  {answerText}
                </p>
              </div>
              <Button onClick={handlePostToBluesky}>
                <Twitter className="h-4 w-4" />
                Post to Bluesky
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
