-- Full-text search setup for User table
-- This migration adds a tsvector column and a GIN index for fast text search

-- Add GIN index on the searchVector column
CREATE INDEX IF NOT EXISTS "User_searchVector_idx" ON "User" USING GIN ("searchVector");

-- Create function to update the search vector
CREATE OR REPLACE FUNCTION update_user_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" := 
    setweight(to_tsvector('english', COALESCE(NEW."fullName", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW."registrationNumber", '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW."registrationCode", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.phone, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector on INSERT or UPDATE
DROP TRIGGER IF EXISTS update_user_search_vector_trigger ON "User";
CREATE TRIGGER update_user_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "fullName", email, "registrationNumber", "registrationCode", phone
  ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION update_user_search_vector();

-- Backfill existing records
UPDATE "User" SET "searchVector" = 
  setweight(to_tsvector('english', COALESCE("fullName", '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(email, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE("registrationNumber", '')), 'B') ||
  setweight(to_tsvector('english', COALESCE("registrationCode", '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(phone, '')), 'C');
