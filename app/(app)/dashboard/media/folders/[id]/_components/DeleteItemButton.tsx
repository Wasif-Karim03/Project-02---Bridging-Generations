"use client";

import { useTransition } from "react";
import { deleteMediaItemAction } from "../actions";

export function DeleteItemButton({ folderId, itemId }: { folderId: string; itemId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteMediaItemAction(folderId, itemId);
        })
      }
      className="text-meta uppercase tracking-[0.06em] text-accent-2-text underline underline-offset-[3px] hover:no-underline disabled:opacity-60"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
