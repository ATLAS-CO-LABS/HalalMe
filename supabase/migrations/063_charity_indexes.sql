-- 063_charity_indexes.sql
--
-- Both the Charity Directory and the charity-applications review queue sort by
-- created_at DESC on every load, with no supporting index. Fine at today's
-- tiny row counts, added proactively before it becomes a real cost.

create index if not exists idx_charities_created_at on public.charities (created_at desc);
create index if not exists idx_charity_applications_created_at on public.charity_applications (created_at desc);
