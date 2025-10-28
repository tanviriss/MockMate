-- Remove unique constraint from answers.question_id to allow multiple answers per question (for follow-ups)

ALTER TABLE answers DROP CONSTRAINT IF EXISTS answers_question_id_key;
