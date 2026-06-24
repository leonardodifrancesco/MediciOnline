-- Dati di base: catalogo specializzazioni mediche.
-- Idempotente: eseguibile più volte senza creare duplicati.

insert into public.specializations (name, slug, description, icon) values
  ('Medicina Generale', 'medicina-generale', 'Visite di medicina generale e check-up', 'stethoscope'),
  ('Cardiologia', 'cardiologia', 'Diagnosi e cura delle patologie cardiovascolari', 'heart-pulse'),
  ('Dermatologia', 'dermatologia', 'Cura della pelle, capelli e unghie', 'sparkles'),
  ('Ginecologia', 'ginecologia', 'Salute femminile e ostetricia', 'flower'),
  ('Pediatria', 'pediatria', 'Cura della salute di neonati, bambini e adolescenti', 'baby'),
  ('Ortopedia', 'ortopedia', 'Apparato muscolo-scheletrico e traumatologia', 'bone'),
  ('Psichiatria', 'psichiatria', 'Diagnosi e cura dei disturbi mentali', 'brain'),
  ('Endocrinologia', 'endocrinologia', 'Sistema endocrino, diabete e metabolismo', 'activity'),
  ('Oculistica', 'oculistica', 'Salute degli occhi e della vista', 'eye'),
  ('Otorinolaringoiatria', 'otorino', 'Orecchio, naso e gola', 'ear'),
  ('Gastroenterologia', 'gastroenterologia', 'Apparato digestivo', 'pill'),
  ('Nutrizione', 'nutrizione', 'Educazione alimentare e percorsi nutrizionali', 'apple')
on conflict (slug) do nothing;
