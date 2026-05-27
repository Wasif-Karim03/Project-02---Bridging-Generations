import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type {
  MediaFolder,
  MediaItem,
  MediaProfile,
  NewMediaFolder,
  NewMediaItem,
  NewMediaProfile,
} from "@/db/schema";
import { mediaFolders, mediaItems, mediaProfiles } from "@/db/schema";

// Profile (per-user) ---------------------------------------------------------

export async function getMediaProfile(userId: string): Promise<MediaProfile | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(mediaProfiles)
    .where(eq(mediaProfiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertMediaProfile(
  args: Omit<NewMediaProfile, "id" | "createdAt" | "updatedAt">,
): Promise<MediaProfile | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db.insert(mediaProfiles).values(args).returning();
  return inserted[0] ?? null;
}

// Folders --------------------------------------------------------------------

// Listing scoped by owner — used on the user's own /dashboard/media. Admins
// use listAllMediaFolders for the cross-user view.
export async function listMediaFoldersForUser(userId: string): Promise<MediaFolder[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(mediaFolders)
    .where(eq(mediaFolders.ownerUserId, userId))
    .orderBy(desc(mediaFolders.eventDate), desc(mediaFolders.createdAt));
}

export async function listAllMediaFolders(): Promise<MediaFolder[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(mediaFolders)
    .orderBy(desc(mediaFolders.eventDate), desc(mediaFolders.createdAt));
}

export async function getMediaFolderById(id: string): Promise<MediaFolder | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(mediaFolders).where(eq(mediaFolders.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function insertMediaFolder(
  args: Omit<NewMediaFolder, "id" | "createdAt" | "updatedAt">,
): Promise<MediaFolder | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db.insert(mediaFolders).values(args).returning();
  return inserted[0] ?? null;
}

export async function deleteMediaFolder(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.delete(mediaFolders).where(eq(mediaFolders.id, id));
}

// Items ----------------------------------------------------------------------

export async function listMediaItemsForFolder(folderId: string): Promise<MediaItem[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.folderId, folderId))
    .orderBy(desc(mediaItems.createdAt));
}

export async function insertMediaItem(
  args: Omit<NewMediaItem, "id" | "createdAt">,
): Promise<MediaItem | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db.insert(mediaItems).values(args).returning();
  return inserted[0] ?? null;
}

export async function deleteMediaItem(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.delete(mediaItems).where(eq(mediaItems.id, id));
}
