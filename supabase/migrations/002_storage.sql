-- Buckets: capas (leitura pública) e exports (privado, versões do e-book)
insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('exports', 'exports', false) on conflict do nothing;

create policy "Leitura pública de capas" on storage.objects
  for select using (bucket_id = 'covers');
create policy "Admin escreve capas" on storage.objects
  for all using (bucket_id = 'covers' and public.is_admin()) with check (bucket_id = 'covers' and public.is_admin());
create policy "Admin gerencia exports" on storage.objects
  for all using (bucket_id = 'exports' and public.is_admin()) with check (bucket_id = 'exports' and public.is_admin());
