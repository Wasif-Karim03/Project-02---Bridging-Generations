import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { boardMemberCollection } from "@/keystatic/collections/boardMember";
import { reader } from "./reader";

export type BoardMember = Entry<typeof boardMemberCollection> & { id: string };

export async function getAllBoardMembers(): Promise<BoardMember[]> {
  const entries = await reader.collections.boardMember.all();
  return entries
    .map(({ slug, entry }) => ({ ...entry, id: slug }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getBoardMemberById(
  id: string | null | undefined,
): Promise<BoardMember | null> {
  if (!id) return null;
  const entry = await reader.collections.boardMember.read(id);
  return entry ? { ...entry, id } : null;
}
