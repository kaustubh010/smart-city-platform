-- Function to update issue votes count
CREATE OR REPLACE FUNCTION update_issue_votes(issue_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE issues
  SET upvotes = (
    SELECT COUNT(*) FROM votes WHERE votes.issue_id = issue_id
  )
  WHERE id = issue_id;
END;
$$;

-- Function to update issue status when comments are added
CREATE OR REPLACE FUNCTION update_issue_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE issues
  SET updated_at = NOW()
  WHERE id = NEW.issue_id;
  RETURN NEW;
END;
$$;

-- Trigger for comment count updates
DROP TRIGGER IF EXISTS update_issue_comment_count_trigger ON comments;
CREATE TRIGGER update_issue_comment_count_trigger
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_issue_comment_count();
