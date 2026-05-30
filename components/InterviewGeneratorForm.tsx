"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const interviewGeneratorSchema = z.object({
  role: z.string().trim().min(2, "Enter the target role."),
  type: z.enum(["technical", "behavioral", "mixed"]),
  level: z.enum(["junior", "mid", "senior", "lead"]),
  techstack: z
    .string()
    .trim()
    .min(2, "Add at least one technology.")
    .refine((value) => value.split(",").map((item) => item.trim()).filter(Boolean).length > 0, {
      message: "Use comma-separated technologies.",
    }),
  amount: z.coerce
    .number()
    .int("Use a whole number.")
    .min(3, "Choose at least 3 questions.")
    .max(10, "Choose at most 10 questions."),
});

type InterviewGeneratorValues = z.infer<typeof interviewGeneratorSchema>;

const levelOptions: Array<{ label: string; value: InterviewGeneratorValues["level"] }> = [
  { label: "Junior", value: "junior" },
  { label: "Mid-Level", value: "mid" },
  { label: "Senior", value: "senior" },
  { label: "Lead", value: "lead" },
];

const typeOptions: Array<{ label: string; value: InterviewGeneratorValues["type"] }> = [
  { label: "Technical", value: "technical" },
  { label: "Behavioral", value: "behavioral" },
  { label: "Mixed", value: "mixed" },
];

const generatorHighlights = [
  "Generates a fresh question set from your role, level, and stack.",
  "Creates the interview record immediately in Firestore.",
  "Sends you straight into the live mock interview after generation.",
];

const InterviewGeneratorForm = ({
  userId,
  userName,
}: {
  userId?: string;
  userName: string;
}) => {
  const router = useRouter();
  const form = useForm<InterviewGeneratorValues>({
    resolver: zodResolver(interviewGeneratorSchema),
    defaultValues: {
      role: "",
      type: "mixed",
      level: "mid",
      techstack: "",
      amount: 5,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: InterviewGeneratorValues) => {
    if (!userId) {
      toast.error("You need to be signed in to generate an interview.");
      return;
    }

    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          userId,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success || !payload?.interviewId) {
        toast.error(payload?.message || "Failed to generate the interview.");
        return;
      }

      toast.success("Interview generated successfully.");
      router.push(`/interview/${payload.interviewId}`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate the interview.";

      toast.error(message);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="card-border w-full">
        <div className="card flex flex-col gap-6 p-8 sm:p-10">
          <div className="flex items-start justify-between gap-4 max-sm:flex-col">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-primary-200">
                Interview Builder
              </p>
              <h3>Generate a Practice Interview</h3>
              <p className="max-w-2xl text-light-100">
                Build a custom mock interview for {userName || "your next role"} and jump
                straight into the session without relying on the Vapi workflow room.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/10 px-4 py-2 text-sm text-primary-100">
              <Sparkles className="size-4" />
              AI Question Set
            </div>
          </div>

          <form className="form grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <label className="label" htmlFor="role">
                Target Role
              </label>
              <Input
                id="role"
                className="input"
                placeholder="Frontend Developer"
                {...form.register("role")}
              />
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="label" htmlFor="level">
                  Experience Level
                </label>
                <select
                  id="level"
                  className="input bg-dark-200 text-light-100"
                  {...form.register("level")}
                >
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.level && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.level.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <label className="label" htmlFor="type">
                  Interview Focus
                </label>
                <select
                  id="type"
                  className="input bg-dark-200 text-light-100"
                  {...form.register("type")}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.type && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="label" htmlFor="techstack">
                Tech Stack
              </label>
              <Input
                id="techstack"
                className="input"
                placeholder="React, Next.js, TypeScript, Firebase"
                {...form.register("techstack")}
              />
              <p className="text-sm text-light-400">
                Separate each technology with a comma.
              </p>
              {form.formState.errors.techstack && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.techstack.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label className="label" htmlFor="amount">
                Number of Questions
              </label>
              <Input
                id="amount"
                min={3}
                max={10}
                step={1}
                type="number"
                className="input"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <Button
              className="btn-primary mt-2 w-full sm:w-fit"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Interview"
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="card-border w-full">
        <div className="card flex h-full flex-col gap-6 p-8">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-primary-200">
              How It Works
            </p>
            <h3>What Happens Next</h3>
          </div>

          <div className="grid gap-3">
            {generatorHighlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/8 bg-dark-200/70 px-4 py-4"
              >
                <p>{item}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-primary-200/15 bg-primary-200/8 px-4 py-4">
            <p className="text-sm text-light-100">
              Voice is still used for the actual interview session after generation. The
              generation step is now local to the app, so the Vapi workflow ejection no
              longer blocks interview creation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewGeneratorForm;
