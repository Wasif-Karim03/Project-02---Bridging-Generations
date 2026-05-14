import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { boardMemberCollection, TeamGroup } from "@/keystatic/collections/boardMember";
import { reader } from "./reader";

export type BoardMember = Entry<typeof boardMemberCollection> & { id: string };
export type { TeamGroup } from "@/keystatic/collections/boardMember";

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

export async function getTeamMembersByGroup(group: TeamGroup): Promise<BoardMember[]> {
  const all = await getAllBoardMembers();
  return all.filter((m) => m.team === group);
}

export type TeamGroupedMembers = Record<TeamGroup, BoardMember[]>;

export async function getAllTeamMembersGrouped(): Promise<TeamGroupedMembers> {
  const all = await getAllBoardMembers();
  const grouped: TeamGroupedMembers = {
    board: [],
    moderator: [],
    rnd: [],
    accounting: [],
    coordinator: [],
    mentor: [],
  };
  for (const m of all) {
    grouped[m.team].push(m);
  }
  return grouped;
}
