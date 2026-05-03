export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
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
  tenantId: string;
  createdAt: string;
  lanes: Lane[];
}

export interface BoardSummary {
  id: string;
  title: string;
  createdAt: string;
}
