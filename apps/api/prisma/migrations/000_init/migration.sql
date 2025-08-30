-- Custom constraints
ALTER TABLE "User" ADD CONSTRAINT users_anon_ck CHECK (
  (account_kind = 'anon' AND email IS NULL AND phone IS NULL AND secret_word_hash IS NOT NULL) OR
  (account_kind = 'regular' AND (email IS NOT NULL OR phone IS NOT NULL))
);

CREATE UNIQUE INDEX uq_conversations_share_slug ON "Conversation"(share_slug) WHERE share_slug IS NOT NULL;
