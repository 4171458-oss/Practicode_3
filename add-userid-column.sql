-- Add UserId column to items table
ALTER TABLE items ADD COLUMN UserId INT NOT NULL DEFAULT 0;

-- Add foreign key constraint
ALTER TABLE items ADD CONSTRAINT FK_Items_Users FOREIGN KEY (UserId) REFERENCES Users(Id);

-- Optional: Update existing items to assign them to a default user
-- UPDATE items SET UserId = 1 WHERE UserId = 0;

