-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS forms;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS teachers;

-- Create teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create parents table
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id),
  teacher_id UUID REFERENCES teachers(id),
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Date fields
  year TEXT,
  month TEXT,
  day TEXT,
  
  -- Teacher form fields
  teacherMood TEXT,
  weeklySong TEXT,
  videoHomework TEXT,
  weeklyHomework TEXT,
  lifeHomework TEXT,
  practiceContent TEXT,
  teacherComments TEXT,
  
  -- Parent form fields
  sleepTime TEXT,
  helpNeeded TEXT,
  breakfast TEXT,
  watch TEXT,
  watch2 TEXT,
  todo TEXT,
  todo2 TEXT,
  parentShare TEXT,
  parentComments TEXT,
  
  -- Create a unique constraint for one form per parent per week
  UNIQUE(parent_id, week_start)
);

-- Insert sample teacher (update with your admin email)
INSERT INTO teachers (name, email, password)
VALUES 
  ('Teacher Demo', 'teacher@example.com', 'password123'),
  ('Admin Teacher', 'bear@bigbearsports.net', 'password123');

-- Insert sample parents
INSERT INTO parents (name, email, password)
VALUES 
  ('Parent One', 'parent1@example.com', 'password123'),
  ('Parent Two', 'parent2@example.com', 'password123'),
  ('Parent Three', 'parent3@example.com', 'password123'); 