import { getRequestContext } from "@cloudflare/next-on-pages";
import createDB from "@/db";
import { desc, eq } from "drizzle-orm";
import { questions } from "@/db/migrations/schema";
import DashboardAnswerCard from "@/components/dashboard-answer-card"; // client
import { avatars } from "@/lib/avatars";

export const runtime = "edge";

export default async function DashboardCards() {
  "use server";

  const DB = getRequestContext().env.DB;
  const drizzle = createDB(DB);

  const allQuestions = await drizzle
    .select({
      id: questions.id,
      question_text: questions.questionText,
      asker_name: questions.askerName,
      createdAt: questions.createdAt,
      isAnswered: questions.isAnswered,
      answer: questions.answer,
    })
    .from(questions)
    .orderBy(desc(questions.createdAt));

  async function submitAnswer(id: number, reply: string) {
    "use server";
    const DB = getRequestContext().env.DB;
    const drizzle = createDB(DB);

    await drizzle
      .update(questions)
      .set({
        isAnswered: true,
        answer: reply,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(questions.id, id));
  }

  return (
    <div className="flex flex-col gap-4">
      {allQuestions.map(
        ({ id, question_text, asker_name, isAnswered, answer }) => (
          <DashboardAnswerCard
            key={id}
            id={id}
            question={question_text}
            askerName={asker_name}
            answered={isAnswered}
            submitAnswer={submitAnswer}
            answer={answer ?? ""}
          />
        )
      )}
    </div>
  );
}
