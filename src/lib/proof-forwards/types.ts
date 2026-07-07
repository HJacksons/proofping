export type ProofForwardDTO = {
  id: string;
  requestId: string;
  recipientEmail: string;
  note: string | null;
  status: string;
  createdAt: string;
  helperLinkUrl?: string;
};
