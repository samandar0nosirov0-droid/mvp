-- Create enum types
CREATE TYPE "Role" AS ENUM ('user','admin_registered','admin_full');
CREATE TYPE "AccountKind" AS ENUM ('anon','regular');
CREATE TYPE "MessageRole" AS ENUM ('user','assistant');
CREATE TYPE "FeedbackValue" AS ENUM ('helpful','unhelpful','unclear');

-- Create tables
CREATE TABLE "users" (
  id TEXT PRIMARY KEY,
  account_kind "AccountKind" NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  secret_word_hash TEXT,
  role "Role" NOT NULL,
  locale TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "conversations" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "users"(id),
  title TEXT NOT NULL,
  share_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "messages" (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES "conversations"(id),
  role "MessageRole" NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "feedback" (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES "messages"(id),
  value "FeedbackValue" NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "exports" (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES "conversations"(id),
  message_id TEXT REFERENCES "messages"(id),
  format TEXT NOT NULL,
  file_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "audit_logs" (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  meta JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- Partial unique index for share_slug
CREATE UNIQUE INDEX "conversations_share_slug_key" ON "conversations"("share_slug") WHERE share_slug IS NOT NULL;

-- Check constraint enforcing anon/regular rules
ALTER TABLE "users" ADD CONSTRAINT "users_anon_ck" CHECK (
  (account_kind = 'anon' AND email IS NULL AND phone IS NULL AND secret_word_hash IS NOT NULL) OR
  (account_kind = 'regular' AND (email IS NOT NULL OR phone IS NOT NULL))
);
