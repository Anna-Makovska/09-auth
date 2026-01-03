import axios from "axios";
import { cookies } from "next/headers";
import type Note from "@/types/note";
import type User from "@/types/user";

const API_BASE_URL = "https://notehub-api.goit.study";

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

// ============================================
// Helper: Get headers with cookies
// ============================================

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return {
    Cookie: cookieHeader,
  };
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

  const headers = await getAuthHeaders();

  const response = await axios.get<FetchNotesResponse>(
    `${API_BASE_URL}/notes`,
    {
      headers,
      params: queryParams,
    }
  );

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const headers = await getAuthHeaders();

  const response = await axios.get<Note>(`${API_BASE_URL}/notes/${id}`, {
    headers,
  });

  return response.data;
};

// ============================================
// User API
// ============================================

export const getMe = async (): Promise<User | null> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.get<User>(`${API_BASE_URL}/users/me`, {
      headers,
    });

    return response.data;
  } catch (error) {
    return null;
  }
};

// ============================================
// Authentication API
// ============================================

export const checkSession = async (): Promise<User | null> => {
  try {
    const headers = await getAuthHeaders();

    const response = await axios.get<User>(`${API_BASE_URL}/auth/session`, {
      headers,
    });

    return response.data || null;
  } catch (error) {
    return null;
  }
};
