-- Migration: Posts/Comments/Likes indexes + comment_likes table
-- Date: 2026-02-16
-- Purpose: Add performance indexes and create comment_likes table for Neon-only social features

CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes (user_id);

CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (comment_id, user_id)
);
