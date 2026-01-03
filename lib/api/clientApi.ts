import apiClient from "./api";
import type Note from "@/types/note";
import type { NoteTag } from "@/types/note";
import type User from "@/types/user";

// ============================================
// Types and Interfaces
// ============================================

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  page: number;
  perPage: number;
}

interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: string;
}

interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

interface RegisterParams {
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface UpdateMeParams {
  username?: string;
}

// ============================================
// Notes API
// ============================================

export const fetchNotes = async (
  params: FetchNotesParams = {}
): Promise<FetchNotesResponse> => {
  const { page = 1, perPage = 12, search = "", tag } = params;

  const queryParams: Record<string, string | number> = {
    page,
    perPage,
    search,
  };

  if (tag && tag !== "all") {
    queryParams.tag = tag;
  }

  const response = await apiClient.get<FetchNotesResponse>("/notes", {
    params: queryParams,
  });

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await apiClient.get<Note>(`/notes/${id}`);
  return response.data;
};

export const createNote = async (noteData: CreateNoteParams): Promise<Note> => {
  const response = await apiClient.post<{ note: Note }>("/notes", noteData);
  return response.data.note;
};

export const deleteNote = async (noteId: string): Promise<Note> => {
  const response = await apiClient.delete<{ note: Note }>(`/notes/${noteId}`);
  return response.data.note;
};

// ============================================
// Authentication API
// ============================================

export const register = async (data: RegisterParams): Promise<User> => {
  const response = await apiClient.post<User>("/auth/register", data);
  return response.data;
};

export const login = async (data: LoginParams): Promise<User> => {
  const response = await apiClient.post<User>("/auth/login", data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const checkSession = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<{ success: boolean; user?: User }>("/auth/session");
    if (response.data.success && response.data.user) {
      return response.data.user;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// ============================================
// User API
// ============================================

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/users/me");
  return response.data;
};

export const updateMe = async (data: UpdateMeParams): Promise<User> => {
  const response = await apiClient.patch<User>("/users/me", data);
  return response.data;
};
