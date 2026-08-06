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
      booking_members: {
        Row: {
          booking_id: string
          created_at: string
          golongan_darah: string | null
          id: string
          is_ketua: boolean
          nama: string
          nik: string | null
          no_hp: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          golongan_darah?: string | null
          id?: string
          is_ketua?: boolean
          nama: string
          nik?: string | null
          no_hp?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          golongan_darah?: string | null
          id?: string
          is_ketua?: boolean
          nama?: string
          nik?: string | null
          no_hp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_members_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          checkin_at: string | null
          checkout_at: string | null
          created_at: string
          id: string
          jalur_id: string
          jalur_nama: string
          jam_mulai: string | null
          jumlah_motor: number
          jumlah_pendaki: number
          kode_booking: string
          metode_pembayaran: string | null
          pakai_ojek: boolean
          rincian_biaya: Json
          status_pembayaran: string
          status_pendakian: string
          tanggal_naik: string
          tipe: string
          total_biaya: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_at?: string | null
          checkout_at?: string | null
          created_at?: string
          id?: string
          jalur_id: string
          jalur_nama: string
          jam_mulai?: string | null
          jumlah_motor?: number
          jumlah_pendaki?: number
          kode_booking: string
          metode_pembayaran?: string | null
          pakai_ojek?: boolean
          rincian_biaya?: Json
          status_pembayaran?: string
          status_pendakian?: string
          tanggal_naik: string
          tipe?: string
          total_biaya?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_at?: string | null
          checkout_at?: string | null
          created_at?: string
          id?: string
          jalur_id?: string
          jalur_nama?: string
          jam_mulai?: string | null
          jumlah_motor?: number
          jumlah_pendaki?: number
          kode_booking?: string
          metode_pembayaran?: string | null
          pakai_ojek?: boolean
          rincian_biaya?: Json
          status_pembayaran?: string
          status_pendakian?: string
          tanggal_naik?: string
          tipe?: string
          total_biaya?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_quotas: {
        Row: {
          id: string
          jalur_id: string
          kuota: number
          tanggal: string
          terpakai: number
          updated_at: string
        }
        Insert: {
          id?: string
          jalur_id: string
          kuota?: number
          tanggal: string
          terpakai?: number
          updated_at?: string
        }
        Update: {
          id?: string
          jalur_id?: string
          kuota?: number
          tanggal?: string
          terpakai?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alamat: string | null
          avatar_url: string | null
          created_at: string
          golongan_darah: string | null
          id: string
          kontak_darurat_hp: string | null
          kontak_darurat_nama: string | null
          nama_lengkap: string | null
          nik: string | null
          no_hp: string | null
          tanggal_lahir: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          avatar_url?: string | null
          created_at?: string
          golongan_darah?: string | null
          id: string
          kontak_darurat_hp?: string | null
          kontak_darurat_nama?: string | null
          nama_lengkap?: string | null
          nik?: string | null
          no_hp?: string | null
          tanggal_lahir?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          avatar_url?: string | null
          created_at?: string
          golongan_darah?: string | null
          id?: string
          kontak_darurat_hp?: string | null
          kontak_darurat_nama?: string | null
          nama_lengkap?: string | null
          nik?: string | null
          no_hp?: string | null
          tanggal_lahir?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trail_status: {
        Row: {
          catatan: string | null
          jalur_id: string
          status: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          jalur_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          jalur_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "pendaki"
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
      app_role: ["admin", "pendaki"],
    },
  },
} as const
