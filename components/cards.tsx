import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getRequestContext } from "@cloudflare/next-on-pages";
import createDB from "@/db";
import { desc, eq } from "drizzle-orm";
import { questions } from "@/db/migrations/schema";
import { LucideCornerLeftUp } from "lucide-react";
import { avatars } from "@/lib/avatars";
export const runtime = "edge";

export default async function Cards() {
  "use server";
  const DB = getRequestContext().env.DB;
  const drizzle = createDB(DB);

  const answeredQuestions = await drizzle
    .select({
      id: questions.id,
      question_text: questions.questionText,
      asker_name: questions.askerName,
      isAnswered: questions.isAnswered,
      answer: questions.answer,
      askerAvatar: questions.askerAvatar,
    })
    .from(questions)
    .where(eq(questions.isAnswered, true))
    .orderBy(desc(questions.updatedAt));

  return (
    <>
      <div className="flex flex-col font-sans gap-4 mb-2">
        {answeredQuestions.map(
          ({ id, question_text, asker_name, answer, askerAvatar }) => (
            <div key={id} className="flex flex-col gap-1">
              <div className="h-auto gap-2 border rounded-xl py-4 bg-card text-card-foreground">
                <div className="flex flex-row items-center gap-2 mx-6 pb-2">
                  <Avatar className="w-[25px] h-[25px]">
                    <AvatarImage
                      src={askerAvatar ? `${askerAvatar}` : `${avatars[0]}`}
                    />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div className="font-medium text-sm/tight">{asker_name}</div>
                </div>
                <div className="">
                  <p
                    className="text-sm/snug px-6 break-words whitespace-pre-wrap"
                    dir="auto"
                  >
                    {question_text}
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-start justify-evenly ml-2">
                <LucideCornerLeftUp className="shrink-0" />
                <div className="bg-accent py-2 rounded-xl grow min-w-0 ">
                  <p
                    dir="auto"
                    className="text-sm/snug px-6 break-words whitespace-pre-wrap overflow-hidden"
                  >
                    {answer}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
