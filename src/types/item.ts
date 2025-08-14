export interface Item {
    id: string;                // UUID from Supabase
    user_id: string | null;    // UUID of the owner
    name: string;              // Item name
    description: string | null; // Optional description
    created_at: string;        // ISO timestamp from Supabase
  }
  