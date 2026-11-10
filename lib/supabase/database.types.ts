export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          owner_id: string;
          cnpj: string;
          razao_social: string;
          nome_fantasia: string | null;
          situacao_cadastral: string | null;
          municipio: string | null;
          uf: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          cnpj: string;
          razao_social: string;
          nome_fantasia?: string | null;
          situacao_cadastral?: string | null;
          municipio?: string | null;
          uf?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          cnpj?: string;
          razao_social?: string;
          nome_fantasia?: string | null;
          situacao_cadastral?: string | null;
          municipio?: string | null;
          uf?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Company = Database["public"]["Tables"]["companies"]["Row"];
