"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { NoteTag } from "@/types/note";
import { useNoteStore } from "@/lib/store/noteStore";
import { createNote } from "@/lib/api/clientApi";
import css from "./NoteForm.module.css";

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteStore();

  const [formData, setFormData] = useState({
    title: draft.title,
    content: draft.content,
    tag: draft.tag,
  });

  const [errors, setErrors] = useState({
    title: "",
    content: "",
  });

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearDraft();
      toast.success("Note created successfully!");
      router.push("/notes");
    },
    onError: (error: Error) => {
      const message = error instanceof Error && 'response' in error
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to create note")
        : "Failed to create note";
      toast.error(message);
    },
  });

  useEffect(() => {
    setFormData({
      title: draft.title,
      content: draft.content,
      tag: draft.tag,
    });
  }, [draft]);

  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "title") {
      if (!value.trim()) {
        error = "Title is required";
      } else if (value.length < 3) {
        error = "Title must be at least 3 characters";
      } else if (value.length > 50) {
        error = "Title must be at most 50 characters";
      }
    }

    if (name === "content") {
      if (value.length > 500) {
        error = "Content must be at most 500 characters";
      }
    }

    return error;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    setDraft({
      title: updatedFormData.title,
      content: updatedFormData.content,
      tag: updatedFormData.tag as NoteTag,
    });

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const titleError = validateField("title", formData.title);
    const contentError = validateField("content", formData.content);

    if (titleError || contentError) {
      setErrors({
        title: titleError,
        content: contentError,
      });
      return;
    }

    mutation.mutate({
      title: formData.title,
      content: formData.content,
      tag: formData.tag as NoteTag,
    });
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={css.input}
        />
        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={8}
          className={css.textarea}
        />
        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          value={formData.tag}
          onChange={handleChange}
          className={css.select}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={() => router.back()} disabled={mutation.isPending}>
          Cancel
        </button>
        <button type="submit" className={css.submitButton} disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
