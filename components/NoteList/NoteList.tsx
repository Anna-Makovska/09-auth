"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteNote } from "@/lib/api/clientApi";
import css from "./NoteList.module.css";
import type Note from "@/types/note";

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <ul className={css.list}>
      {notes.map((note) => {
        const noteId = note.id ?? note._id ?? "";
        return (
        <li key={noteId} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{note.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <Link href={`/notes/${noteId}`} className={css.viewDetailsLink}>
              View details
            </Link>
            <button
              onClick={() => handleDelete(noteId)}
              disabled={deleteMutation.isPending}
              className={css.deleteButton}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </li>
      );
    })}
    </ul>
  );
}
