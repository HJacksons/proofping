import "server-only";

import { prisma } from "@/lib/server/db";

export const SAMPLE_SEED_EMAIL = "samples@getproofping.internal";

type SampleAsk = {
  title: string;
  body: string;
  category: string;
  locationHint: string;
  minutesAgo: number;
  replies?: Array<{
    helperName: string;
    body: string;
    verdict: "CONFIRMED" | "SUSPICIOUS" | "UNSURE";
    minutesAgo: number;
  }>;
};

/** Believable campus / city asks for Help nearby. Idempotent per seed user. */
const SAMPLE_ASKS: SampleAsk[] = [
  {
    title: "Is the P35 printer working right now?",
    body: "Need to print before class. Anyone near the lab printers?",
    category: "FACILITY_OR_QUEUE",
    locationHint: "OsloMet – storbyuniversitetet, Oslo, Norge",
    minutesAgo: 18,
    replies: [
      {
        helperName: "Maja",
        body: "Yes — both printers on floor 2 are up. Short queue (~3 people).",
        verdict: "CONFIRMED",
        minutesAgo: 11,
      },
    ],
  },
  {
    title: "How long is the Bobst entrance queue?",
    body: "Heading over now. Worth it, or try another entrance?",
    category: "FACILITY_OR_QUEUE",
    locationHint: "Bobst Library, NYU, New York, USA",
    minutesAgo: 32,
    replies: [
      {
        helperName: "Jordan",
        body: "Main doors ~8 minutes. Side entrance near the plaza is moving faster.",
        verdict: "CONFIRMED",
        minutesAgo: 24,
      },
    ],
  },
  {
    title: "Is Doe Library still open for study?",
    body: "Maps say open but last time doors were locked early. Anyone inside?",
    category: "LOCAL_SITUATION",
    locationHint: "Doe Library, UC Berkeley, California, USA",
    minutesAgo: 45,
  },
  {
    title: "Is the St Pancras reading room packed?",
    body: "Need a quiet desk for 90 minutes. Should I go elsewhere?",
    category: "LOCAL_SITUATION",
    locationHint: "British Library, London, UK",
    minutesAgo: 55,
    replies: [
      {
        helperName: "Priya",
        body: "Busy but not full — still seats on the south side. Noise is normal library level.",
        verdict: "CONFIRMED",
        minutesAgo: 40,
      },
    ],
  },
  {
    title: "Is the campus cafe open this afternoon?",
    body: "Coffee + power outlet needed near Auraria. Confirm before I walk over.",
    category: "LOCAL_SITUATION",
    locationHint: "Auraria Campus, Denver, USA",
    minutesAgo: 70,
    replies: [
      {
        helperName: "Chris",
        body: "Open. Espresso machine is fine; only a couple of tables free near the windows.",
        verdict: "CONFIRMED",
        minutesAgo: 58,
      },
    ],
  },
  {
    title: "Food court line — how bad is it?",
    body: "Between classes. If it’s 20+ minutes I’ll grab something else.",
    category: "FACILITY_OR_QUEUE",
    locationHint: "MIT Student Center, Cambridge, USA",
    minutesAgo: 25,
    replies: [
      {
        helperName: "Alex",
        body: "About 10 minutes for the main counter. Salad bar has no line.",
        verdict: "CONFIRMED",
        minutesAgo: 14,
      },
    ],
  },
  {
    title: "Is Green Library quiet floor actually quiet?",
    body: "Need deep focus. If it’s loud I’ll go to a cafe instead.",
    category: "LOCAL_SITUATION",
    locationHint: "Green Library, Stanford, California, USA",
    minutesAgo: 90,
    replies: [
      {
        helperName: "Sam",
        body: "Quiet floor is solid right now. A few people, no group chatter.",
        verdict: "CONFIRMED",
        minutesAgo: 75,
      },
    ],
  },
  {
    title: "Is this Marketplace laptop listing still available?",
    body: "Seller says “like new, campus pickup today.” Anyone able to confirm the meet spot looks real?",
    category: "SELLER_OR_SHOP",
    locationHint: "Columbia University, New York, USA",
    minutesAgo: 120,
    replies: [
      {
        helperName: "Taylor",
        body: "Meet spot is a busy plaza (good). Seller delayed twice and wants off-platform payment — be careful.",
        verdict: "SUSPICIOUS",
        minutesAgo: 95,
      },
    ],
  },
];

function minutesAgoDate(minutes: number) {
  return new Date(Date.now() - minutes * 60_000);
}

export async function seedSampleActivity() {
  const user = await prisma.user.upsert({
    where: { email: SAMPLE_SEED_EMAIL },
    create: {
      email: SAMPLE_SEED_EMAIL,
      isAdultVerified: true,
      role: "REQUESTER",
    },
    update: {
      isAdultVerified: true,
    },
  });

  await prisma.proofReply.deleteMany({
    where: {
      proofRequest: {
        creatorId: user.id,
      },
    },
  });
  await prisma.proofRequest.deleteMany({
    where: {
      creatorId: user.id,
    },
  });

  for (const ask of SAMPLE_ASKS) {
    const created = await prisma.proofRequest.create({
      data: {
        creatorId: user.id,
        title: ask.title,
        body: ask.body,
        category: ask.category,
        locationHint: ask.locationHint,
        status: "OPEN",
        visibility: "LOCAL_DISCOVERY",
        createdAt: minutesAgoDate(ask.minutesAgo),
        updatedAt: minutesAgoDate(ask.minutesAgo),
      },
    });

    for (const reply of ask.replies ?? []) {
      await prisma.proofReply.create({
        data: {
          requestId: created.id,
          helperName: reply.helperName,
          body: reply.body,
          verdict: reply.verdict,
          createdAt: minutesAgoDate(reply.minutesAgo),
        },
      });
    }
  }

  return {
    userId: user.id,
    email: SAMPLE_SEED_EMAIL,
    asks: SAMPLE_ASKS.length,
    proofs: SAMPLE_ASKS.reduce(
      (total, ask) => total + (ask.replies?.length ?? 0),
      0,
    ),
  };
}
