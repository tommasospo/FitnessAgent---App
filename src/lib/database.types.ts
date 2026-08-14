export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      allenamento_rilevato: {
        Row: {
          battito_max: number | null
          battito_medio: number | null
          created_at: string
          distanza_km: number | null
          durata_minuti: number | null
          energia_attiva_kcal: number | null
          fine: string
          fonte: string
          id: string
          inizio: string
          tipo: string
        }
        Insert: {
          battito_max?: number | null
          battito_medio?: number | null
          created_at?: string
          distanza_km?: number | null
          durata_minuti?: number | null
          energia_attiva_kcal?: number | null
          fine: string
          fonte?: string
          id?: string
          inizio: string
          tipo: string
        }
        Update: {
          battito_max?: number | null
          battito_medio?: number | null
          created_at?: string
          distanza_km?: number | null
          durata_minuti?: number | null
          energia_attiva_kcal?: number | null
          fine?: string
          fonte?: string
          id?: string
          inizio?: string
          tipo?: string
        }
        Relationships: []
      }
      attivita_giornaliera: {
        Row: {
          battito_max: number | null
          battito_medio: number | null
          battito_min: number | null
          battito_riposo: number | null
          created_at: string
          data: string
          distanza_km: number | null
          energia_attiva_kcal: number | null
          fonte: string
          hrv_ms: number | null
          id: string
          minuti_esercizio: number | null
          minuti_movimento: number | null
          passi: number | null
          vo2_max: number | null
        }
        Insert: {
          battito_max?: number | null
          battito_medio?: number | null
          battito_min?: number | null
          battito_riposo?: number | null
          created_at?: string
          data: string
          distanza_km?: number | null
          energia_attiva_kcal?: number | null
          fonte?: string
          hrv_ms?: number | null
          id?: string
          minuti_esercizio?: number | null
          minuti_movimento?: number | null
          passi?: number | null
          vo2_max?: number | null
        }
        Update: {
          battito_max?: number | null
          battito_medio?: number | null
          battito_min?: number | null
          battito_riposo?: number | null
          created_at?: string
          data?: string
          distanza_km?: number | null
          energia_attiva_kcal?: number | null
          fonte?: string
          hrv_ms?: number | null
          id?: string
          minuti_esercizio?: number | null
          minuti_movimento?: number | null
          passi?: number | null
          vo2_max?: number | null
        }
        Relationships: []
      }
      diario_alimentare: {
        Row: {
          carboidrati_g: number | null
          created_at: string
          data: string
          fonte: string
          grassi_g: number | null
          id: string
          kcal: number | null
          proteine_g: number | null
        }
        Insert: {
          carboidrati_g?: number | null
          created_at?: string
          data: string
          fonte?: string
          grassi_g?: number | null
          id?: string
          kcal?: number | null
          proteine_g?: number | null
        }
        Update: {
          carboidrati_g?: number | null
          created_at?: string
          data?: string
          fonte?: string
          grassi_g?: number | null
          id?: string
          kcal?: number | null
          proteine_g?: number | null
        }
        Relationships: []
      }
      intervento_agente: {
        Row: {
          autore_agente: string
          contenuto: string | null
          data: string
          id: string
          riferimento_thread_buzz: string | null
          risposta_ricevuta: boolean
          tipo: Database["public"]["Enums"]["intervento_tipo"]
        }
        Insert: {
          autore_agente: string
          contenuto?: string | null
          data?: string
          id?: string
          riferimento_thread_buzz?: string | null
          risposta_ricevuta?: boolean
          tipo: Database["public"]["Enums"]["intervento_tipo"]
        }
        Update: {
          autore_agente?: string
          contenuto?: string | null
          data?: string
          id?: string
          riferimento_thread_buzz?: string | null
          risposta_ricevuta?: boolean
          tipo?: Database["public"]["Enums"]["intervento_tipo"]
        }
        Relationships: []
      }
      marker_ematico: {
        Row: {
          created_at: string
          data_prelievo: string
          documento_origine_id: string | null
          fuori_range: boolean | null
          id: string
          marker: string
          range_max: number | null
          range_min: number | null
          unita: string | null
          valore: number
        }
        Insert: {
          created_at?: string
          data_prelievo: string
          documento_origine_id?: string | null
          fuori_range?: boolean | null
          id?: string
          marker: string
          range_max?: number | null
          range_min?: number | null
          unita?: string | null
          valore: number
        }
        Update: {
          created_at?: string
          data_prelievo?: string
          documento_origine_id?: string | null
          fuori_range?: boolean | null
          id?: string
          marker?: string
          range_max?: number | null
          range_min?: number | null
          unita?: string | null
          valore?: number
        }
        Relationships: []
      }
      metrica_corporea: {
        Row: {
          created_at: string
          data: string
          fonte: string | null
          id: string
          tipo: Database["public"]["Enums"]["metrica_tipo"]
          valore: number
        }
        Insert: {
          created_at?: string
          data?: string
          fonte?: string | null
          id?: string
          tipo: Database["public"]["Enums"]["metrica_tipo"]
          valore: number
        }
        Update: {
          created_at?: string
          data?: string
          fonte?: string | null
          id?: string
          tipo?: Database["public"]["Enums"]["metrica_tipo"]
          valore?: number
        }
        Relationships: []
      }
      nota_agente: {
        Row: {
          autore_agente: string
          contenuto: string
          created_at: string
          destinatario_id: string
          destinatario_tipo: string
          id: string
        }
        Insert: {
          autore_agente: string
          contenuto: string
          created_at?: string
          destinatario_id: string
          destinatario_tipo: string
          id?: string
        }
        Update: {
          autore_agente?: string
          contenuto?: string
          created_at?: string
          destinatario_id?: string
          destinatario_tipo?: string
          id?: string
        }
        Relationships: []
      }
      obiettivo: {
        Row: {
          created_at: string
          data_target: string | null
          descrizione: string
          id: string
          metrica_di_successo: string | null
          stato: Database["public"]["Enums"]["obiettivo_stato"]
          tipo: Database["public"]["Enums"]["obiettivo_tipo"]
        }
        Insert: {
          created_at?: string
          data_target?: string | null
          descrizione: string
          id?: string
          metrica_di_successo?: string | null
          stato?: Database["public"]["Enums"]["obiettivo_stato"]
          tipo: Database["public"]["Enums"]["obiettivo_tipo"]
        }
        Update: {
          created_at?: string
          data_target?: string | null
          descrizione?: string
          id?: string
          metrica_di_successo?: string | null
          stato?: Database["public"]["Enums"]["obiettivo_stato"]
          tipo?: Database["public"]["Enums"]["obiettivo_tipo"]
        }
        Relationships: []
      }
      piano: {
        Row: {
          autore_agente: string
          contenuto: Json
          data_attivazione: string | null
          data_creazione: string
          durata_settimane: number | null
          feedback_utente: string | null
          id: string
          motivazione: string | null
          piano_precedente_id: string | null
          riferimento_thread_buzz: string | null
          stato: Database["public"]["Enums"]["piano_stato"]
          tipo: Database["public"]["Enums"]["piano_tipo"]
          versione: number
        }
        Insert: {
          autore_agente: string
          contenuto?: Json
          data_attivazione?: string | null
          data_creazione?: string
          durata_settimane?: number | null
          feedback_utente?: string | null
          id?: string
          motivazione?: string | null
          piano_precedente_id?: string | null
          riferimento_thread_buzz?: string | null
          stato?: Database["public"]["Enums"]["piano_stato"]
          tipo: Database["public"]["Enums"]["piano_tipo"]
          versione?: number
        }
        Update: {
          autore_agente?: string
          contenuto?: Json
          data_attivazione?: string | null
          data_creazione?: string
          durata_settimane?: number | null
          feedback_utente?: string | null
          id?: string
          motivazione?: string | null
          piano_precedente_id?: string | null
          riferimento_thread_buzz?: string | null
          stato?: Database["public"]["Enums"]["piano_stato"]
          tipo?: Database["public"]["Enums"]["piano_tipo"]
          versione?: number
        }
        Relationships: [
          {
            foreignKeyName: "piano_piano_precedente_id_fkey"
            columns: ["piano_precedente_id"]
            isOneToOne: false
            referencedRelation: "piano"
            referencedColumns: ["id"]
          },
        ]
      }
      sessione_eseguita: {
        Row: {
          created_at: string
          data_effettiva: string
          durata_minuti: number | null
          id: string
          note_libere: string | null
          rpe_sessione: number | null
          saltata: boolean
          serie_eseguite: Json
          sessione_prescritta_id: string | null
        }
        Insert: {
          created_at?: string
          data_effettiva?: string
          durata_minuti?: number | null
          id?: string
          note_libere?: string | null
          rpe_sessione?: number | null
          saltata?: boolean
          serie_eseguite?: Json
          sessione_prescritta_id?: string | null
        }
        Update: {
          created_at?: string
          data_effettiva?: string
          durata_minuti?: number | null
          id?: string
          note_libere?: string | null
          rpe_sessione?: number | null
          saltata?: boolean
          serie_eseguite?: Json
          sessione_prescritta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessione_eseguita_sessione_prescritta_id_fkey"
            columns: ["sessione_prescritta_id"]
            isOneToOne: false
            referencedRelation: "sessione_prescritta"
            referencedColumns: ["id"]
          },
        ]
      }
      sessione_prescritta: {
        Row: {
          created_at: string
          esercizi: Json
          giorno_numero: number
          id: string
          piano_id: string
          tipo: Database["public"]["Enums"]["sessione_tipo"]
        }
        Insert: {
          created_at?: string
          esercizi?: Json
          giorno_numero: number
          id?: string
          piano_id: string
          tipo: Database["public"]["Enums"]["sessione_tipo"]
        }
        Update: {
          created_at?: string
          esercizi?: Json
          giorno_numero?: number
          id?: string
          piano_id?: string
          tipo?: Database["public"]["Enums"]["sessione_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "sessione_prescritta_piano_id_fkey"
            columns: ["piano_id"]
            isOneToOne: false
            referencedRelation: "piano"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      intervento_tipo: "check_settimanale" | "anomalia" | "chiarimento"
      metrica_tipo: "peso" | "circonferenza" | "massa_grassa" | "altro"
      obiettivo_stato: "attivo" | "raggiunto" | "abbandonato" | "interrotto"
      obiettivo_tipo: "evento" | "metrica" | "abitudine"
      piano_stato: "proposta" | "attivo" | "archiviato"
      piano_tipo: "allenamento" | "nutrizione"
      sessione_tipo: "palestra" | "corsa" | "nuoto" | "altro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      intervento_tipo: ["check_settimanale", "anomalia", "chiarimento"],
      metrica_tipo: ["peso", "circonferenza", "massa_grassa", "altro"],
      obiettivo_stato: ["attivo", "raggiunto", "abbandonato", "interrotto"],
      obiettivo_tipo: ["evento", "metrica", "abitudine"],
      piano_stato: ["proposta", "attivo", "archiviato"],
      piano_tipo: ["allenamento", "nutrizione"],
      sessione_tipo: ["palestra", "corsa", "nuoto", "altro"],
    },
  },
} as const
