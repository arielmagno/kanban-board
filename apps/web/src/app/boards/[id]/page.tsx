import type { Metadata } from 'next';
import { BoardPageClient } from '@/features/board/components/board-page-client';

export const metadata: Metadata = { title: 'Board — BoardFlow' };

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BoardPageClient boardId={id} />;
}
