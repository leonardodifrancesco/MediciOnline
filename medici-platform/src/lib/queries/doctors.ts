import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ConsultationType } from "@/lib/types/database.types";

export const DOCTORS_PER_PAGE = 12;

export interface DoctorSearchFilters {
  specializzazione?: string;
  modalita?: "video" | "in_person" | "";
  citta?: string;
  prezzoMax?: number;
  pagina?: number;
}

export interface DoctorCardData {
  profileId: string;
  slug: string;
  fullName: string;
  avatarUrl: string | null;
  yearsExperience: number | null;
  consultationFee: number;
  currency: string;
  consultationType: ConsultationType;
  city: string | null;
  averageRating: number;
  totalReviews: number;
  specializations: { name: string; slug: string }[];
}

type DoctorProfileRow = {
  profile_id: string;
  slug: string;
  years_experience: number | null;
  consultation_fee: number;
  currency: string;
  consultation_type: ConsultationType;
  city: string | null;
  average_rating: number;
  total_reviews: number;
  bio?: string | null;
  languages?: string[];
  profiles: { full_name: string; avatar_url: string | null } | { full_name: string; avatar_url: string | null }[] | null;
  doctor_specializations: { specializations: { name: string; slug: string } | { name: string; slug: string }[] | null }[] | null;
};

/** Normalizza le relazioni annidate: con il client tipizzato a mano possono
 * arrivare come oggetto singolo o come array a seconda della query. */
function toOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapDoctorRow(row: DoctorProfileRow): DoctorCardData {
  const profile = toOne(row.profiles);
  const specializations = (row.doctor_specializations ?? [])
    .map((link) => toOne(link.specializations))
    .filter((spec): spec is { name: string; slug: string } => !!spec);

  return {
    profileId: row.profile_id,
    slug: row.slug,
    fullName: profile?.full_name ?? "Medico",
    avatarUrl: profile?.avatar_url ?? null,
    yearsExperience: row.years_experience,
    consultationFee: row.consultation_fee,
    currency: row.currency,
    consultationType: row.consultation_type,
    city: row.city,
    averageRating: row.average_rating,
    totalReviews: row.total_reviews,
    specializations,
  };
}

const DOCTOR_CARD_SELECT = `
  profile_id, slug, years_experience, consultation_fee, currency,
  consultation_type, city, average_rating, total_reviews,
  profiles ( full_name, avatar_url ),
  doctor_specializations ( specializations ( name, slug ) )
`;

export async function searchDoctors(filters: DoctorSearchFilters) {
  const supabase = await createServerSupabaseClient();

  // Se è attivo un filtro per specializzazione, risolviamo prima l'elenco
  // di doctor_id corrispondenti: evita un filtro annidato fragile su due
  // livelli di join in un'unica query PostgREST.
  let doctorIdsFilter: string[] | null = null;

  if (filters.specializzazione) {
    const { data: spec } = await supabase
      .from("specializations")
      .select("id")
      .eq("slug", filters.specializzazione)
      .maybeSingle();

    if (!spec) {
      return { doctors: [] as DoctorCardData[], total: 0 };
    }

    const { data: links } = await supabase
      .from("doctor_specializations")
      .select("doctor_id")
      .eq("specialization_id", spec.id);

    doctorIdsFilter = (links ?? []).map((link) => link.doctor_id);
    if (doctorIdsFilter.length === 0) {
      return { doctors: [] as DoctorCardData[], total: 0 };
    }
  }

  const page = Math.max(1, filters.pagina ?? 1);
  const from = (page - 1) * DOCTORS_PER_PAGE;
  const to = from + DOCTORS_PER_PAGE - 1;

  let query = supabase
    .from("doctor_profiles")
    .select(DOCTOR_CARD_SELECT, { count: "exact" })
    .eq("is_visible", true);

  if (doctorIdsFilter) {
    query = query.in("profile_id", doctorIdsFilter);
  }
  if (filters.citta) {
    query = query.ilike("city", `%${filters.citta}%`);
  }
  if (filters.modalita === "video") {
    query = query.in("consultation_type", ["video", "both"]);
  }
  if (filters.modalita === "in_person") {
    query = query.in("consultation_type", ["in_person", "both"]);
  }
  if (filters.prezzoMax) {
    query = query.lte("consultation_fee", filters.prezzoMax);
  }

  const { data, count } = await query
    .order("average_rating", { ascending: false })
    .range(from, to);

  return {
    doctors: ((data ?? []) as unknown as DoctorProfileRow[]).map(mapDoctorRow),
    total: count ?? 0,
  };
}

export interface DoctorProfileDetail extends DoctorCardData {
  bio: string | null;
  languages: string[];
  address: string | null;
}

export async function getDoctorBySlug(slug: string): Promise<DoctorProfileDetail | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("doctor_profiles")
    .select(
      `${DOCTOR_CARD_SELECT}, bio, languages, address`,
    )
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as DoctorProfileRow & {
    languages: string[];
    address: string | null;
  };

  return {
    ...mapDoctorRow(row),
    bio: row.bio ?? null,
    languages: row.languages ?? [],
    address: row.address,
  };
}

export interface DoctorReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewerLabel: string;
}

export async function getDoctorReviews(doctorId: string): Promise<DoctorReviewItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles ( full_name )")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false })
    .limit(5);

  return ((data ?? []) as unknown as Array<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: { full_name: string } | { full_name: string }[] | null;
  }>).map((row) => {
    const reviewer = toOne(row.profiles);
    const [firstName, ...rest] = (reviewer?.full_name ?? "Paziente").split(" ");
    const lastInitial = rest.length > 0 ? `${rest[rest.length - 1]![0]}.` : "";
    return {
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
      reviewerLabel: [firstName, lastInitial].filter(Boolean).join(" "),
    };
  });
}

export async function getAllSpecializations() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("specializations").select("id, name, slug").order("name");
  return data ?? [];
}
