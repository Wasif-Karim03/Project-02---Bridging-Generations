// The 15-day mentor call question bank, supplied by the program team.
// Each question stores its answer in mentor_calls.answers keyed by `id`.
//
// To change the set without losing historical answers:
//   • Add a new id — old calls simply don't include it
//   • Don't rename existing ids — answers reference them in JSONB
//   • To retire a question, append "(retired)" to the prompt instead of
//     deleting it, so older answers still render
//
// Every question carries an English + Bangla prompt; the call form shows
// both so a bilingual mentor can read from whichever they prefer.

export type MentorCallQuestion = {
  id: string;
  section: string; // section key, see MENTOR_CALL_SECTIONS
  prompt: string; // English
  promptBn: string; // Bangla
};

export type MentorCallSection = {
  key: string;
  title: string; // English
  titleBn: string; // Bangla
};

// Ordered — the form renders sections in this order. The check-in comes
// first (it's the "since we last spoke" opener), then the deeper sets.
export const MENTOR_CALL_SECTIONS: MentorCallSection[] = [
  { key: "checkin", title: "Check-in", titleBn: "শুরুর কথা" },
  { key: "a", title: "Getting to know them", titleBn: "তাদের সম্পর্কে জানা" },
  { key: "b", title: "Goals & direction", titleBn: "লক্ষ্য ও ভবিষ্যৎ দিকনির্দেশনা" },
  { key: "c", title: "Learning & challenges", titleBn: "পড়াশোনা ও চ্যালেঞ্জ" },
  { key: "d", title: "Problem-solving & mindset", titleBn: "সমস্যা সমাধান ও মানসিকতা" },
  { key: "e", title: "Confidence & emotions", titleBn: "আত্মবিশ্বাস ও অনুভূতি" },
  { key: "f", title: "Growth & accountability", titleBn: "উন্নতি ও দায়িত্বশীলতা" },
  { key: "g", title: "Academic progress", titleBn: "একাডেমিক অগ্রগতি" },
  { key: "h", title: "Goals & motivation", titleBn: "লক্ষ্য ও প্রেরণা" },
  { key: "i", title: "Study habits & time management", titleBn: "পড়ার অভ্যাস ও সময় ব্যবস্থাপনা" },
  { key: "j", title: "Strengths & weaknesses", titleBn: "শক্তি ও দুর্বলতা" },
  { key: "k", title: "Support system", titleBn: "সহায়তা ব্যবস্থা" },
  { key: "l", title: "Personal development", titleBn: "ব্যক্তিগত উন্নয়ন" },
];

export const MENTOR_CALL_QUESTIONS: MentorCallQuestion[] = [
  // ---- Check-in (the "since we last met" opener) ----
  {
    id: "chk1",
    section: "checkin",
    prompt: "How have you been since the last time we talked or met?",
    promptBn: "শেষবার আমরা কথা বলার বা দেখা করার পর থেকে তুমি কেমন আছো?",
  },
  {
    id: "chk2",
    section: "checkin",
    prompt: "What do you think of the progress you have made recently?",
    promptBn: "সম্প্রতি তুমি যে অগ্রগতি করেছো, সে সম্পর্কে তোমার কী মনে হয়?",
  },
  {
    id: "chk3",
    section: "checkin",
    prompt: "What were your marks in Math, English, and Science?",
    promptBn: "গণিত, ইংরেজি এবং বিজ্ঞানে তোমার কত নম্বর ছিল?",
  },
  {
    id: "chk4",
    section: "checkin",
    prompt: "What were your marks in Physics, Biology, Chemistry, and Higher Mathematics?",
    promptBn: "পদার্থবিজ্ঞান, জীববিজ্ঞান, রসায়ন এবং উচ্চতর গণিতে তোমার কত নম্বর ছিল?",
  },
  {
    id: "chk5",
    section: "checkin",
    prompt: "What do you hope for the future?",
    promptBn: "ভবিষ্যৎ নিয়ে তোমার কী আশা বা স্বপ্ন আছে?",
  },

  // ---- A. Getting to know them ----
  {
    id: "a1",
    section: "a",
    prompt: "What do you enjoy most about school right now?",
    promptBn: "এখন স্কুলের কোন বিষয়টি তুমি সবচেয়ে উপভোগ করছ?",
  },
  {
    id: "a2",
    section: "a",
    prompt: "What's something you've been proud of recently?",
    promptBn: "সম্প্রতি কোন কাজের জন্য তুমি গর্ববোধ করেছ?",
  },
  {
    id: "a3",
    section: "a",
    prompt: "What do you like doing outside of school?",
    promptBn: "স্কুলের বাইরে তুমি কী করতে পছন্দ করো?",
  },

  // ---- B. Goals & direction ----
  {
    id: "b1",
    section: "b",
    prompt: "What do you want to get better at this year?",
    promptBn: "এই বছরে তুমি কোন বিষয়ে আরও ভালো হতে চাও?",
  },
  {
    id: "b2",
    section: "b",
    prompt: "Is there something you wish was easier for you?",
    promptBn: "এমন কিছু আছে যা তুমি চাইছ সহজ হোক?",
  },
  {
    id: "b3",
    section: "b",
    prompt: "What kind of person do you want to become?",
    promptBn: "তুমি ভবিষ্যতে কেমন মানুষ হতে চাও?",
  },

  // ---- C. Learning & challenges ----
  {
    id: "c1",
    section: "c",
    prompt: "Which subject feels hardest, and why?",
    promptBn: "কোন বিষয়টি সবচেয়ে কঠিন লাগে, এবং কেন?",
  },
  {
    id: "c2",
    section: "c",
    prompt: "What do you usually do when you don't understand something?",
    promptBn: "কিছু বুঝতে না পারলে তুমি সাধারণত কী করো?",
  },
  {
    id: "c3",
    section: "c",
    prompt: "What helps you learn best — reading, practice, or someone explaining?",
    promptBn: "তোমার শেখার জন্য কোন পদ্ধতি সবচেয়ে ভালো — পড়া, অনুশীলন, নাকি কারও ব্যাখ্যা?",
  },

  // ---- D. Problem-solving & mindset ----
  {
    id: "d1",
    section: "d",
    prompt: "What do you think is getting in your way right now?",
    promptBn: "তোমার মতে বর্তমানে কোন বিষয়টি তোমাকে আটকে রাখছে?",
  },
  {
    id: "d2",
    section: "d",
    prompt: "What's one small step you could try this week?",
    promptBn: "এই সপ্তাহে তুমি ছোট কোন পদক্ষেপ নিতে পারো?",
  },
  {
    id: "d3",
    section: "d",
    prompt: "What would you do differently next time?",
    promptBn: "পরেরবার তুমি কী ভিন্নভাবে করতে চাও?",
  },

  // ---- E. Confidence & emotions ----
  {
    id: "e1",
    section: "e",
    prompt: "When do you feel most confident at school?",
    promptBn: "স্কুলে কখন তুমি সবচেয়ে আত্মবিশ্বাসী অনুভব করো?",
  },
  {
    id: "e2",
    section: "e",
    prompt: "What makes you feel nervous or stuck?",
    promptBn: "কোন বিষয় তোমাকে নার্ভাস বা আটকে দেয়?",
  },
  {
    id: "e3",
    section: "e",
    prompt: "Who do you talk to when something is bothering you?",
    promptBn: "কোন সমস্যা হলে তুমি সাধারণত কার সাথে কথা বলো?",
  },

  // ---- F. Growth & accountability ----
  {
    id: "f1",
    section: "f",
    prompt: "What's one goal you want to achieve before we meet again?",
    promptBn: "আমাদের পরবর্তী দেখা হওয়ার আগে তুমি কোন একটি লক্ষ্য অর্জন করতে চাও?",
  },
  {
    id: "f2",
    section: "f",
    prompt: "How can I support you with that?",
    promptBn: "এতে আমি কীভাবে তোমাকে সাহায্য করতে পারি?",
  },
  {
    id: "f3",
    section: "f",
    prompt: "What will you do first?",
    promptBn: "তুমি প্রথমে কী করবে?",
  },

  // ---- G. Academic progress ----
  {
    id: "g1",
    section: "g",
    prompt: "What subjects or topics are you finding most interesting right now?",
    promptBn: "বর্তমানে কোন বিষয় বা টপিক তোমার সবচেয়ে আগ্রহের?",
  },
  {
    id: "g2",
    section: "g",
    prompt: "Which subjects are you struggling with, and why do you think that is?",
    promptBn: "কোন বিষয়গুলোতে তুমি সমস্যায় পড়ছ, এবং কেন বলে মনে হয়?",
  },
  {
    id: "g3",
    section: "g",
    prompt: "How do you usually prepare for exams or assignments?",
    promptBn: "পরীক্ষা বা অ্যাসাইনমেন্টের জন্য তুমি সাধারণত কীভাবে প্রস্তুতি নাও?",
  },

  // ---- H. Goals & motivation ----
  {
    id: "h1",
    section: "h",
    prompt: "What are your short-term goals (this term/year)?",
    promptBn: "তোমার স্বল্পমেয়াদি লক্ষ্য কী (এই টার্ম/বছরে)?",
  },
  {
    id: "h2",
    section: "h",
    prompt: "What are your long-term goals or dreams?",
    promptBn: "তোমার দীর্ঘমেয়াদি স্বপ্ন বা লক্ষ্য কী?",
  },
  {
    id: "h3",
    section: "h",
    prompt: "What motivates you to study or improve?",
    promptBn: "তোমাকে পড়াশোনা বা উন্নতি করতে কী অনুপ্রাণিত করে?",
  },

  // ---- I. Study habits & time management ----
  {
    id: "i1",
    section: "i",
    prompt: "How do you manage your study time?",
    promptBn: "তুমি কীভাবে পড়াশোনার সময় পরিচালনা করো?",
  },
  {
    id: "i2",
    section: "i",
    prompt: "Do you have a daily or weekly routine?",
    promptBn: "তোমার কি দৈনিক বা সাপ্তাহিক রুটিন আছে?",
  },
  {
    id: "i3",
    section: "i",
    prompt: "What study methods work best for you?",
    promptBn: "কোন পড়ার পদ্ধতি তোমার জন্য সবচেয়ে কার্যকর?",
  },

  // ---- J. Strengths & weaknesses ----
  {
    id: "j1",
    section: "j",
    prompt: "What do you think are your strongest skills?",
    promptBn: "তোমার মতে তোমার সবচেয়ে বড় দক্ষতা কী?",
  },
  {
    id: "j2",
    section: "j",
    prompt: "Where do you feel you need the most improvement?",
    promptBn: "কোন জায়গায় তোমার সবচেয়ে বেশি উন্নতি দরকার?",
  },
  {
    id: "j3",
    section: "j",
    prompt: "Have you noticed any patterns in your mistakes?",
    promptBn: "তোমার ভুলগুলোর মধ্যে কোনো নির্দিষ্ট ধরণ কি লক্ষ্য করেছ?",
  },

  // ---- K. Support system ----
  {
    id: "k1",
    section: "k",
    prompt: "Do you feel comfortable asking for help when needed?",
    promptBn: "প্রয়োজনে সাহায্য চাইতে তুমি কি স্বাচ্ছন্দ্যবোধ করো?",
  },
  {
    id: "k2",
    section: "k",
    prompt: "Who do you usually go to when you have a problem?",
    promptBn: "সমস্যা হলে তুমি সাধারণত কার কাছে যাও?",
  },
  {
    id: "k3",
    section: "k",
    prompt: "Are your parents / guardians involved in your learning?",
    promptBn: "তোমার বাবা-মা বা অভিভাবকরা কি তোমার পড়াশোনায় যুক্ত আছেন?",
  },

  // ---- L. Personal development ----
  {
    id: "l1",
    section: "l",
    prompt: "What activities do you enjoy outside of studies?",
    promptBn: "পড়াশোনার বাইরে তুমি কোন কাজগুলো উপভোগ করো?",
  },
  {
    id: "l2",
    section: "l",
    prompt: "How do you handle stress or pressure?",
    promptBn: "চাপ বা দুশ্চিন্তা কীভাবে সামলাও?",
  },
  {
    id: "l3",
    section: "l",
    prompt: "What skills would you like to develop (communication, confidence, etc.)?",
    promptBn: "কোন দক্ষতাগুলো তুমি উন্নত করতে চাও (যোগাযোগ, আত্মবিশ্বাস ইত্যাদি)?",
  },
];

// Mentoring guidance shown as a collapsible reference on the call page —
// principles, not input fields. Bilingual like the questions.
export type MentorGuidancePoint = { en: string; bn: string };

export const MENTOR_GUIDANCE: MentorGuidancePoint[] = [
  {
    en: "Start by understanding the person. Don't jump into advice — ask what they want, where they're struggling, and what success looks like to them.",
    bn: "প্রথমে মানুষটিকে বুঝুন। পরামর্শ দেওয়ার জন্য তাড়াহুড়া করবেন না — জিজ্ঞেস করুন তারা কী চায়, কোথায় সমস্যায় পড়ছে এবং তাদের কাছে সফলতার মানে কী।",
  },
  {
    en: "Listen more than you talk. Ask questions like 'What do you think is the best next step?' to build their confidence and decision-making.",
    bn: "বলার চেয়ে বেশি শুনুন। 'তোমার মতে পরবর্তী সেরা পদক্ষেপ কী?' — এমন প্রশ্ন করুন, যাতে তাদের আত্মবিশ্বাস ও সিদ্ধান্ত নেওয়ার ক্ষমতা বাড়ে।",
  },
  {
    en: "Share experience, not orders. Frame input as perspective — 'Here's what worked for me…' They should still own their choices.",
    bn: "নির্দেশ নয়, অভিজ্ঞতা শেয়ার করুন। 'আমার ক্ষেত্রে যেটা কাজে লেগেছিল…' — এভাবে বলুন। সিদ্ধান্তের মালিকানা তাদেরই থাকা উচিত।",
  },
  {
    en: "Be honest, but constructive. Point out mistakes clearly, then focus on how to improve.",
    bn: "সৎ হন, তবে গঠনমূলকভাবে। ভুলগুলো স্পষ্টভাবে দেখান, তারপর কীভাবে উন্নতি করা যায় সেদিকে গুরুত্ব দিন।",
  },
  {
    en: "Set small, clear goals. Break big ambitions into manageable steps, then check in on progress.",
    bn: "ছোট ও স্পষ্ট লক্ষ্য নির্ধারণ করুন। বড় স্বপ্নকে ছোট ধাপে ভাগ করুন, তারপর অগ্রগতি নিয়মিত দেখুন।",
  },
  {
    en: "Encourage accountability. Ask them to follow through on what they say — consistently, not harshly.",
    bn: "দায়িত্বশীলতা গড়ে তুলুন। তারা যা করার কথা বলে তা যেন করে — ধারাবাহিকভাবে, কঠোরভাবে নয়।",
  },
  {
    en: "Be reliable. Show up, respond, stay engaged. Inconsistent mentors lose trust quickly.",
    bn: "নির্ভরযোগ্য হোন। সময় দিন, উত্তর দিন, সম্পৃক্ত থাকুন। অনিয়মিত মেন্টরের প্রতি মানুষ দ্রুত আস্থা হারায়।",
  },
  {
    en: "Know your limits. If something is outside your expertise, say so — a mentor doesn't need to know everything.",
    bn: "নিজের সীমাবদ্ধতা জানুন। কোনো বিষয় আপনার দক্ষতার বাইরে হলে তা স্বীকার করুন — মেন্টরের সবকিছু জানা জরুরি নয়।",
  },
  {
    en: "Focus on independence. The goal is to help them become confident enough to think and act on their own.",
    bn: "স্বাধীনতার দিকে গুরুত্ব দিন। লক্ষ্য হলো তাদের এমন আত্মবিশ্বাসী করে তোলা যাতে তারা নিজেরাই চিন্তা ও সিদ্ধান্ত নিতে পারে।",
  },
  {
    en: "Quick tip: if the student gives short answers, don't rush to fill the silence. Follow up with 'Can you tell me more about that?' or 'Why do you think that is?'",
    bn: "পরামর্শ: শিক্ষার্থী ছোট উত্তর দিলে তাড়াহুড়া করে নীরবতা পূরণ করবেন না। ফলো-আপ করুন — 'এ ব্যাপারে আর একটু বলতে পারো?' বা 'তোমার কেন এমন মনে হয়?'",
  },
];
