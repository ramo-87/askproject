import { getRequestContext } from "@cloudflare/next-on-pages";
import createDB from "@/db";
import { questions } from "@/db/migrations/schema";
import { ModeToggle } from "@/components/theme-toggle";
import Cards from "@/components/cards";
import { generateRandomName } from "@/lib/names";
import QuestionForm from "@/components/questionform";
import z from "zod";
import { avatars } from "@/lib/avatars";

export const runtime = "edge";

export default function Home() {
  async function submitQuestion(formData: FormData) {
    "use server";

    const rawFormData = formData.get("question-text");

    const DB = getRequestContext().env.DB;
    const drizzle = createDB(DB);

    const zSchema = z
      .string()
      .trim()
      .min(4, { message: "Message has to be longer than 4 characters." })
      .max(2000, { message: "Message has to be less than 2000 characters." });
    const result = await zSchema.safeParseAsync(rawFormData);

    if (!result.success) {
      return { error: result.error.issues[0].message, success: false };
    }

    const askerName = generateRandomName();
    const isAnswered = false;
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    await drizzle.insert(questions).values({
      questionText: result.data,
      askerName,
      isAnswered,
      askerAvatar: `${avatar}`,
    });

    return { success: true };
  }
  return (
    <main className="flex flex-col gap-6 mt-16 font-sans w-10/12 mx-auto h-auto max-w-sm md:max-w-lg">
      <div className="flex flex-row items-center justify-between">
        <p className="text-3xl font-bold tracking-tight">Askinator</p>
        <ModeToggle />
      </div>
      <QuestionForm submitQuestion={submitQuestion} />
      <Cards />
    </main>
  );
}
