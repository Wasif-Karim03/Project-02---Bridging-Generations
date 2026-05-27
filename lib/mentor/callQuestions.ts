// Question set for the 15-day mentor call. Placeholders — real questions
// from the program team will land here later. Storage keys are stable
// (q1..q6) so swapping the prompt text doesn't require a data migration.
//
// To change the set without losing historical answers:
//   • Add a new id (q7, q8, …) — old calls don't include it
//   • Don't rename existing ids — answers reference them in JSONB
//   • Mark deprecated ids with a "(retired)" suffix in the prompt instead
//     of deleting them, so old answers still render

export type MentorCallQuestion = {
  id: string;
  prompt: string;
  hint?: string;
};

export const MENTOR_CALL_QUESTIONS: MentorCallQuestion[] = [
  {
    id: "q1",
    prompt: "How is the student doing overall?",
    hint: "One or two sentences. Mood, energy, anything noticeable.",
  },
  {
    id: "q2",
    prompt: "What did you discuss this call?",
    hint: "Topics, concerns, follow-ups from last time.",
  },
  {
    id: "q3",
    prompt: "Any attendance or study concerns?",
    hint: "Missed days, falling behind, struggling with a subject.",
  },
  {
    id: "q4",
    prompt: "What's the student excited about right now?",
    hint: "Subjects, hobbies, social things, plans.",
  },
  {
    id: "q5",
    prompt: "Action items for next call?",
    hint: "What you'll follow up on next time.",
  },
  {
    id: "q6",
    prompt: "Anything the board should know?",
    hint: "Optional. Family issues, school changes, anything that needs admin attention.",
  },
];
