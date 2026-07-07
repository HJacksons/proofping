import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  getEvidenceExtension,
  type AllowedEvidenceMimeType,
} from "@/lib/evidence/validation";

const storageRoot = path.join(process.cwd(), "storage", "evidence");

export type SavedEvidenceFile = {
  storageKey: string;
  mimeType: AllowedEvidenceMimeType;
  originalName: string;
  sizeBytes: number;
  buffer: Buffer;
};

export function getEvidenceStorageRoot() {
  return storageRoot;
}

export function getEvidenceAbsolutePath(storageKey: string) {
  const resolvedRoot = path.resolve(storageRoot);
  const resolvedFile = path.resolve(storageRoot, storageKey);

  if (!resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Invalid evidence storage path.");
  }

  return resolvedFile;
}

export async function saveEvidenceFile(
  file: SavedEvidenceFile,
): Promise<string> {
  await mkdir(storageRoot, { recursive: true });

  const absolutePath = getEvidenceAbsolutePath(file.storageKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, file.buffer);

  return file.storageKey;
}

export function buildEvidenceStorageKey(mimeType: AllowedEvidenceMimeType) {
  return `${randomUUID()}.${getEvidenceExtension(mimeType)}`;
}

export async function readEvidenceFile(storageKey: string) {
  const { readFile } = await import("node:fs/promises");

  return readFile(getEvidenceAbsolutePath(storageKey));
}
