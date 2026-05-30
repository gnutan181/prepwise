import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateObject } from "ai";
import { z } from "zod";

const generateInterviewSchema = z.object({
  type: z.string().trim().min(1, "Interview type is required."),
  role: z.string().trim().min(1, "Role is required."),
  level: z.string().trim().min(1, "Experience level is required."),
  techstack: z.union([z.string(), z.array(z.string())]),
  amount: z.coerce.number().int().min(1).max(10),
  userId: z.string().trim().min(1, "User id is required."),
});

const questionSchema = z.object({
  questions: z.array(z.string().trim().min(1)).min(1),
});

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Failed to generate interview.";
};

export async function GET(){
    return Response.json({success:true,data:"thank you"} ,
        {status:200}
    )
} 

export async function POST(request:Request){
    try {
        const rawPayload = await request.json();
        const parsedPayload = generateInterviewSchema.safeParse({
          type: rawPayload?.type ?? rawPayload?.interviewType,
          role: rawPayload?.role ?? rawPayload?.jobRole,
          level:
            rawPayload?.level ??
            rawPayload?.experienceLevel ??
            rawPayload?.experience,
          techstack: rawPayload?.techstack ?? rawPayload?.techStack ?? "",
          amount: rawPayload?.amount ?? rawPayload?.questionCount ?? 5,
          userId: rawPayload?.userId ?? rawPayload?.userid ?? rawPayload?.uid,
        });

        if (!parsedPayload.success) {
          return Response.json(
            {
              success: false,
              message: parsedPayload.error.issues[0]?.message ?? "Invalid request payload.",
            },
            { status: 400 }
          );
        }

        const { type, role, level, techstack, amount, userId } = parsedPayload.data;
        const normalizedTechStack = Array.isArray(techstack)
          ? techstack.map((item) => item.trim()).filter(Boolean)
          : techstack
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured.");
        }

        const { object } = await generateObject({
          model: google("gemini-3-flash-preview"),
          schema: questionSchema,
          prompt: `Prepare questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${normalizedTechStack.join(", ")}.
The focus between behavioural and technical questions should lean towards: ${type}.
The amount of questions required is: ${amount}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.`,
        });

        const interview = {
          role,
          type,
          level,
          techstack: normalizedTechStack,
          questions: object.questions,
          userId,
          finalized: true,
          coverImage: getRandomInterviewCover(),
          createdAt: new Date().toISOString(),
        };
// console.log(interview,"intervieedw")
        const interviewRef = await db.collection("interviews").add(interview);
// console.log(interviewRef,"interviewRef")
        return Response.json(
          {
            success: true,
            interviewId: interviewRef.id,
            interview,
          },
          { status: 200 }
        );
    } catch (error) {
        console.error("Failed to generate interview:", error);
        return Response.json(
          {
            success: false,
            message: getErrorMessage(error),
          },
          { status: 500 }
        );
    }
}
