export function canViewOwnedProofRequest(
  viewerUserId: string | null,
  creatorUserId: string,
): boolean {
  return viewerUserId === creatorUserId;
}
