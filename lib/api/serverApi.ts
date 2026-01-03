import axios, { AxiosResponse } from "axios";
import { cookies } from "next/headers";
import type Note from "@/types/note";
import type User from "@/types/user";

const API_BASE_URL = "https://notehub-api.goit.study";

// Create a dedicated Axios instance for server-side API calls
const serverApiClient = axios.create({
  baseURL: API_BASE_URL,
});

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

  const response = await serverApiClient.get<FetchNotesResponse>("/notes", {
    headers,
    params: queryParams,
  });

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const headers = await getAuthHeaders();

  const response = await serverApiClient.get<Note>(`/notes/${id}`, {
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

    const response = await serverApiClient.get<User>("/users/me", {
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

export const checkSession = async (): Promise<AxiosResponse<User>> => {
  const headers = await getAuthHeaders();

  const response = await serverApiClient.get<User>("/auth/session", {
    headers,
  });

  return response;
};
