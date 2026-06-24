/**
 * Tipi del database generati a mano sulla base di `schema-database.sql`.
 *
 * Quando il progetto è collegato a un'istanza Supabase reale, è preferibile
 * rigenerare questo file con:
 *   supabase gen types typescript --linked > src/lib/types/database.types.ts
 *
 * Nel frattempo questo file è la fonte di verità per i tipi usati da
 * Server Components, Server Actions e client Supabase.
 */

export type UserRole = "patient" | "doctor" | "admin";

export type DoctorVerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export type ConsultationType = "in_person" | "video" | "both";

export type AppointmentStatus =
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled_by_patient"
  | "cancelled_by_doctor"
  | "no_show";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type DocumentType =
  | "medical_license"
  | "id_card"
  | "degree_certificate"
  | "other";

export type DocumentStatus = "pending" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      patient_details: {
        Row: {
          profile_id: string;
          date_of_birth: string | null;
          gender: string | null;
          fiscal_code: string | null;
          address: string | null;
          city: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["patient_details"]["Row"]
        > & { profile_id: string };
        Update: Partial<Database["public"]["Tables"]["patient_details"]["Row"]>;
      };
      specializations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["specializations"]["Row"]
        > & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["specializations"]["Row"]>;
      };
      doctor_profiles: {
        Row: {
          profile_id: string;
          slug: string;
          bio: string | null;
          years_experience: number | null;
          license_number: string;
          consultation_fee: number;
          currency: string;
          consultation_type: ConsultationType;
          languages: string[];
          city: string | null;
          address: string | null;
          verification_status: DoctorVerificationStatus;
          verified_at: string | null;
          rejected_reason: string | null;
          average_rating: number;
          total_reviews: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["doctor_profiles"]["Row"]
        > & {
          profile_id: string;
          slug: string;
          license_number: string;
          consultation_fee: number;
        };
        Update: Partial<Database["public"]["Tables"]["doctor_profiles"]["Row"]>;
      };
      doctor_specializations: {
        Row: {
          doctor_id: string;
          specialization_id: string;
        };
        Insert: Database["public"]["Tables"]["doctor_specializations"]["Row"];
        Update: Partial<
          Database["public"]["Tables"]["doctor_specializations"]["Row"]
        >;
      };
      doctor_documents: {
        Row: {
          id: string;
          doctor_id: string;
          document_type: DocumentType;
          file_path: string;
          status: DocumentStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          uploaded_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["doctor_documents"]["Row"]
        > & {
          doctor_id: string;
          document_type: DocumentType;
          file_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["doctor_documents"]["Row"]>;
      };
      doctor_stripe_accounts: {
        Row: {
          doctor_id: string;
          stripe_account_id: string;
          charges_enabled: boolean;
          payouts_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["doctor_stripe_accounts"]["Row"]
        > & { doctor_id: string; stripe_account_id: string };
        Update: Partial<
          Database["public"]["Tables"]["doctor_stripe_accounts"]["Row"]
        >;
      };
      availability_rules: {
        Row: {
          id: string;
          doctor_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_duration_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["availability_rules"]["Row"]
        > & {
          doctor_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["availability_rules"]["Row"]
        >;
      };
      availability_exceptions: {
        Row: {
          id: string;
          doctor_id: string;
          exception_date: string;
          is_available: boolean;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["availability_exceptions"]["Row"]
        > & { doctor_id: string; exception_date: string };
        Update: Partial<
          Database["public"]["Tables"]["availability_exceptions"]["Row"]
        >;
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          specialization_id: string | null;
          scheduled_start: string;
          scheduled_end: string;
          status: AppointmentStatus;
          consultation_type: ConsultationType;
          patient_notes: string | null;
          price: number;
          cancelled_reason: string | null;
          cancelled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]> & {
          patient_id: string;
          doctor_id: string;
          scheduled_start: string;
          scheduled_end: string;
          consultation_type: ConsultationType;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
      };
      payments: {
        Row: {
          id: string;
          appointment_id: string;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          amount: number;
          application_fee_amount: number;
          currency: string;
          status: PaymentStatus;
          paid_at: string | null;
          refunded_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          appointment_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
      };
      reviews: {
        Row: {
          id: string;
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          appointment_id: string;
          patient_id: string;
          doctor_id: string;
          rating: number;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_table: string;
          target_id: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["admin_audit_log"]["Row"]
        > & {
          admin_id: string;
          action: string;
          target_table: string;
          target_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_audit_log"]["Row"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PatientDetails =
  Database["public"]["Tables"]["patient_details"]["Row"];
export type Specialization =
  Database["public"]["Tables"]["specializations"]["Row"];
export type DoctorProfile =
  Database["public"]["Tables"]["doctor_profiles"]["Row"];
export type DoctorDocument =
  Database["public"]["Tables"]["doctor_documents"]["Row"];
export type AvailabilityRule =
  Database["public"]["Tables"]["availability_rules"]["Row"];
export type AvailabilityException =
  Database["public"]["Tables"]["availability_exceptions"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
