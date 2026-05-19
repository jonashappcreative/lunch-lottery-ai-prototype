
-- Employees
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '—',
  avatar_url TEXT,
  draw_count INTEGER NOT NULL DEFAULT 0,
  eligible BOOLEAN NOT NULL DEFAULT true,
  blocked_until_threshold_met BOOLEAN NOT NULL DEFAULT false,
  drawn_since_block UUID[] NOT NULL DEFAULT '{}',
  last_won_round_id UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drawn_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pool_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.round_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reveal_order INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  employee_department TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_round_winners_round ON public.round_winners(round_id);
CREATE INDEX idx_employees_sort ON public.employees(sort_order);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_winners ENABLE ROW LEVEL SECURITY;

-- Public access (MVP, no auth)
CREATE POLICY "public read employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "public write employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "public update employees" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "public delete employees" ON public.employees FOR DELETE USING (true);

CREATE POLICY "public read rounds" ON public.rounds FOR SELECT USING (true);
CREATE POLICY "public write rounds" ON public.rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "public update rounds" ON public.rounds FOR UPDATE USING (true);
CREATE POLICY "public delete rounds" ON public.rounds FOR DELETE USING (true);

CREATE POLICY "public read winners" ON public.round_winners FOR SELECT USING (true);
CREATE POLICY "public write winners" ON public.round_winners FOR INSERT WITH CHECK (true);
CREATE POLICY "public update winners" ON public.round_winners FOR UPDATE USING (true);
CREATE POLICY "public delete winners" ON public.round_winners FOR DELETE USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatars publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatars publicly uploadable" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Avatars publicly updatable" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Avatars publicly deletable" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
