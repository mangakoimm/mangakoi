-- Sample data to test MangaKoi end to end.
-- Run this after schema.sql in the Supabase SQL editor.

insert into genres (name) values
  ('Romance'),('Action'),('Horror'),('Comedy'),('Fantasy'),('Isekai')
on conflict (name) do nothing;

insert into manga (slug, title, description, author, artist, cover_url, status, release_year, rating, views)
values
  ('crimson-blade', 'Crimson Blade', 'A wandering swordsman seeks the ronin who destroyed his village.', 'H. Sato', 'H. Sato', null, 'ongoing', 2021, 4.7, 812000),
  ('sakura-requiem', 'Sakura Requiem', 'Two rival idols fall for each other during a citywide festival.', 'M. Kondo', 'Y. Aihara', null, 'completed', 2019, 4.9, 1240000),
  ('hollow-kingdom', 'Hollow Kingdom', 'An exiled prince builds an army of monsters to reclaim his throne.', 'R. Iwata', 'R. Iwata', null, 'ongoing', 2023, 4.4, 340000)
on conflict (slug) do nothing;

insert into manga_genres (manga_id, genre_id)
select m.id, g.id from manga m, genres g
where (m.slug = 'crimson-blade' and g.name in ('Action','Fantasy'))
   or (m.slug = 'sakura-requiem' and g.name in ('Romance','Comedy'))
   or (m.slug = 'hollow-kingdom' and g.name in ('Fantasy','Action'));

insert into chapters (manga_id, number, title)
select id, n, 'Chapter ' || n
from manga, generate_series(1, 5) as n
where manga.slug = 'crimson-blade';

insert into pages (chapter_id, page_number, image_url)
select c.id, p, 'https://placeholder.example/' || c.number || '/' || p || '.jpg'
from chapters c, generate_series(1, 6) as p
where c.manga_id = (select id from manga where slug = 'crimson-blade');
