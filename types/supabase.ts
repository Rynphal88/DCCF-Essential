// types/supabase.ts

export type Database = {
  public: {
    Tables: {
      artifacts: {
        Row: {
          id: number;
          type: string;
          title: string;
          description: string;
          created_at: string;
        };
        Insert: {
          type: string;
          title: string;
          description: string;
          created_at?: string;
        };
        Update: {
          type?: string;
          title?: string;
          description?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
