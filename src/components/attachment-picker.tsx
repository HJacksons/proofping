"use client";

import { useRef, useState } from "react";

import {
  allowedEvidenceMimeTypes,
  MAX_EVIDENCE_FILE_BYTES,
} from "@/lib/evidence/validation";

type AttachmentPickerProps = {
  inputId: string;
  maxFiles: number;
  label?: string;
  helpText?: string;
  onChange: (files: File[]) => void;
};

export function AttachmentPicker({
  inputId,
  maxFiles,
  label = "Photos",
  helpText = `Up to ${maxFiles} JPEG, PNG, or WebP photos. 8 MB each.`,
  onChange,
}: AttachmentPickerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function revokePreviewUrls(urls: string[]) {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }

  function updateFiles(nextFiles: File[]) {
    revokePreviewUrls(previewUrlsRef.current);

    const nextPreviewUrls = nextFiles.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = nextPreviewUrls;
    setFiles(nextFiles);
    setPreviewUrls(nextPreviewUrls);
    onChange(nextFiles);

    if (nextFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const nextError = validateSelectedFiles(selected, maxFiles);

    if (nextError) {
      setError(nextError);
      event.target.value = "";
      updateFiles([]);
      return;
    }

    setError(null);
    updateFiles(selected.slice(0, maxFiles));
  }

  function removeFile(index: number) {
    setError(null);
    updateFiles(files.filter((_, fileIndex) => fileIndex !== index));
  }

  return (
    <div className="grid gap-2">
      <label className="grid gap-1.5" htmlFor={inputId}>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm text-muted">{helpText}</span>
        <input
          accept={allowedEvidenceMimeTypes.join(",")}
          className="block w-full text-sm text-muted file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-accent-soft file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-accent-strong"
          id={inputId}
          multiple={maxFiles > 1}
          name="attachments"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      </label>

      {previewUrls.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {previewUrls.map((url, index) => (
            <div className="relative" key={url}>
              {/* User-selected local previews are shown before upload. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={files[index]?.name ?? `Selected photo ${index + 1}`}
                className="h-20 w-20 rounded-lg border border-line object-cover"
                src={url}
              />
              <button
                aria-label={`Remove ${files[index]?.name ?? "photo"}`}
                className="absolute -right-2 -top-2 rounded-full border border-line bg-surface px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-background"
                onClick={() => removeFile(index)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm font-medium text-amber-900">{error}</p> : null}
    </div>
  );
}

function validateSelectedFiles(files: File[], maxFiles: number) {
  if (files.length > maxFiles) {
    return `You can attach up to ${maxFiles} photos.`;
  }

  for (const file of files) {
    if (
      !allowedEvidenceMimeTypes.includes(
        file.type as (typeof allowedEvidenceMimeTypes)[number],
      )
    ) {
      return "Only JPEG, PNG, and WebP photos are allowed.";
    }

    if (file.size > MAX_EVIDENCE_FILE_BYTES) {
      return "Each photo must be 8 MB or smaller.";
    }
  }

  return null;
}
