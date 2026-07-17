import { randomUUID } from "node:crypto";

process.env.APP_URL ??= "http://localhost:3000";
process.env.DATABASE_URL ??=
  "postgresql://proofping:proofping@localhost:5432/proofping?schema=public";
process.env.AUTH_SECRET ??= `${randomUUID()}${randomUUID()}`;
