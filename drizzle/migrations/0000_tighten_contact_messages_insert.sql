DROP POLICY IF EXISTS "anyone can send a message" ON public.contact_messages;
CREATE POLICY "anyone can send a valid message" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(name)) BETWEEN 1 AND 200
  AND char_length(email) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND char_length(btrim(message)) BETWEEN 1 AND 5000
  AND (company IS NULL OR char_length(company) <= 200)
);