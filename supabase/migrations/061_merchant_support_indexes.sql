-- 061_merchant_support_indexes.sql
--
-- Two hot columns with no index: the admin merchant list filters/sorts by
-- merchants.status and merchants.created_at on every load, and both the
-- user and admin support inboxes sort by support_conversations.last_message_at.
-- Fine at current volume — added proactively before it becomes a real cost.

create index if not exists idx_merchants_status on public.merchants (status);
create index if not exists idx_merchants_created_at on public.merchants (created_at desc);
create index if not exists idx_support_conversations_last_message_at on public.support_conversations (last_message_at desc);
