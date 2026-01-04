"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchNoteById, deleteNote } from "@/lib/api/clientApi";
import css from "./NoteDetails.module.css";

interface NoteDetailsClientProps {
  id: string;
}

export default function NoteDetailsClient({ id }: NoteDetailsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: note, isLoading, error } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  if (isLoading) {
    return <p>Loading, please wait...</p>;
  }

  if (error || !note) {
    return <p>Something went wrong.</p>;
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(id);
        queryClient.invalidateQueries({ queryKey: ["notes"] });
        toast.success("Note deleted successfully!");
        router.push("/notes/filter/all");
      } catch (error) {
        toast.error("Failed to delete note");
        console.error("Failed to delete note:", error);
      }
    }
  };

  return (
    <main className={css.main}>
      <div className={css.container}>
        <div className={css.item}>
          <div className={css.header}>
            <h2>{note.title}</h2>
          </div>
          <p className={css.content}>{note.content}</p>
          <p className={css.date}>{new Date(note.createdAt).toLocaleDateString()}</p>
          <button
            onClick={handleDelete}
            className={css.deleteButton}
          >
            Delete
          </button>
        </div>
      </div>
    </main>
  );
}
