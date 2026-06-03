insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true) on conflict do nothing;
