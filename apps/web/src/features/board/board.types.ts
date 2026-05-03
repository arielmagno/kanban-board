export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  laneId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lane {
  id: string;
  title: string;
  position: number;
  isDefault: boolean;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  color?: string | null;
  tenantId: string;
  createdAt: string;
  lanes: Lane[];
}

export interface BoardOwner {
  id: string;
  fullName: string | null;
  email: string;
}

export interface BoardSummary {
  id: string;
  title: string;
  color?: string | null;
  isPublic: boolean;
  createdAt: string;
  owner: BoardOwner;
}
