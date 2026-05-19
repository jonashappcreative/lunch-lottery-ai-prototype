
ALTER TABLE public.employees ADD COLUMN location TEXT NOT NULL DEFAULT 'Hamburg';
ALTER TABLE public.rounds ADD COLUMN location TEXT NOT NULL DEFAULT 'Hamburg';

CREATE INDEX idx_employees_location ON public.employees(location);
CREATE INDEX idx_rounds_location ON public.rounds(location);

-- Seed 50 Düsseldorf employees
WITH first_names AS (
  SELECT unnest(ARRAY['Anna','Ben','Clara','David','Elena','Felix','Greta','Hannes','Ida','Jonas','Klara','Leo','Mia','Noah','Olivia','Paul','Quinn','Rosa','Simon','Tilda','Uwe','Vera','Wim','Xenia','Yara','Zoe','Alex','Bea','Cem','Dana','Emil','Frieda','Gustav','Helen','Ilias','Jana','Karim','Lina','Marko','Nora','Omar','Pia','Ravi','Sara','Tom','Ulrike','Valerie','Wolf','Yusuf','Zara']) AS n
),
last_names AS (
  SELECT unnest(ARRAY['Schmidt','Müller','Weber','Fischer','Becker','Wagner','Hoffmann','Schulz','Koch','Bauer','Klein','Wolf','Neumann','Schwarz','Zimmermann','Braun','Krüger','Hofmann','Hartmann','Lange','Schmitt','Werner','Krause','Meier','Lehmann','Schmid','Schulze','Maier','Köhler','Herrmann','König','Walter','Mayer','Huber','Kaiser','Fuchs','Peters','Lang','Scholz','Möller','Weiß','Jung','Hahn','Schubert','Vogel','Friedrich','Keller','Günther','Frank','Berger']) AS n
),
combos AS (
  SELECT
    f.n || ' ' || l.n AS full_name,
    (ARRAY['Engineering','Product','Design','Marketing','Sales','People','Finance','Operations'])[1 + (abs(hashtext(f.n || l.n || 'd')) % 8)] AS dept,
    abs(hashtext(f.n || l.n || 'duss')) AS r
  FROM first_names f CROSS JOIN last_names l
)
INSERT INTO public.employees (name, department, location, sort_order)
SELECT full_name, dept, 'Düsseldorf', 10000 + ROW_NUMBER() OVER (ORDER BY r)
FROM combos
ORDER BY r
LIMIT 50;
