import type { Metadata } from 'next';
import { BoardList } from '@/features/board/components/board-list';

export const metadata: Metadata = { title: 'Boards — BoardFlow' };

export default function BoardsPage() {
  return <BoardList />;
}
