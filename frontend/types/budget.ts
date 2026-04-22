// Budget Type Definition - Shared Rule
// Pooja MUST import this. NEVER redefine.

export interface BudgetResponse {
  limit: number;
  spent: number;
  remaining: number;
  progress: number; // (spent/limit)*100, limit=0 → progress=0
  period: string; // YYYY-MM format
}

export interface BudgetRequest {
  limit: number;
  period?: string; // optional, defaults to current month
}

export interface BudgetError {
  message: string;
  code?: number;
}
