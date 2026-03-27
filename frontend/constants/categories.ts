import type { Category } from "../types/transaction";

// ── Shared category definitions ──
// Used by both the transaction screen (UI rendering) and the useTransactions
// hook (initial data). Define here once; import everywhere.
export const CATEGORIES: Category[] = [
  { icon: "trending-up-outline",        bg: "#10B981", label: "Income"        },
  { icon: "cart-outline",               bg: "#8B5CF6", label: "Shopping"      },
  { icon: "book-outline",               bg: "#3B82F6", label: "Education"     },
  { icon: "card-outline",               bg: "#EF4444", label: "Loans"         },
  { icon: "restaurant-outline",         bg: "#F59E0B", label: "Food"          },
  { icon: "car-outline",                bg: "#6366F1", label: "Transport"     },
  { icon: "medkit-outline",             bg: "#EC4899", label: "Health"        },
  { icon: "home-outline",               bg: "#14B8A6", label: "Housing"       },
  { icon: "game-controller-outline",    bg: "#F97316", label: "Entertainment" },
  { icon: "ellipsis-horizontal-outline",bg: "#6B7280", label: "Other"         },
];
