-- Migration to add url and achievement_type fields to achievements table

-- Check if the url column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'url') THEN
        ALTER TABLE achievements ADD COLUMN url TEXT;
    END IF;
END $$;

-- Check if the achievement_type column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'achievement_type') THEN
        ALTER TABLE achievements ADD COLUMN achievement_type TEXT;
        -- Add check constraint for achievement_type
        ALTER TABLE achievements ADD CONSTRAINT achievement_type_check 
            CHECK (achievement_type IN ('professional', 'academic', 'personal', 'other'));
    END IF;
END $$;