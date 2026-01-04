import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/serverApi";
import { getQueryClient } from "@/lib/getQueryClient";
import NotePreview from "./NotePreview.client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterceptedNotePage({ params }: PageProps) {
  const resolvedParams = await params;
  const noteId = resolvedParams.id;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteById(noteId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotePreview noteId={noteId} />
    </HydrationBoundary>
  );
}
