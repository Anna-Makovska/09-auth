"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchNoteById, deleteNote } from "@/lib/api/clientApi";
import Modal from "@/components/Modal/Modal";
import css from "./NotePreview.module.css";

interface NotePreviewProps {
  noteId: string;
}

export default function NotePreview({ noteId }: NotePreviewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: note } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteById(noteId),
  });

  const handleClose = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setIsDeleting(true);
      try {
        await deleteNote(noteId);
        queryClient.invalidateQueries({ queryKey: ["notes"] });
        toast.success("Note deleted successfully!");
        handleClose();
        setTimeout(() => {
          router.push("/notes/filter/all");
        }, 100);
      } catch (error) {
        toast.error("Failed to delete note");
        console.error("Failed to delete note:", error);
        setIsDeleting(false);
      }
    }
  };

  if (!note) return null;

  return (
    <Modal onClose={handleClose}>
      <div className={css.container}>
        <div className={css.header}>
          <h2>{note.title}</h2>
        </div>
        <p className={css.content}>{note.content}</p>
        <p className={css.date}>
          {new Date(note.createdAt).toLocaleDateString()}
        </p>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={css.deleteButton}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
