-- Database Schema for Mantra Tracker (Vercel Postgres)
-- Run this in Vercel Postgres dashboard or via API

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mantras table
CREATE TABLE IF NOT EXISTS mantras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    goal INTEGER NOT NULL DEFAULT 108,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mantra sessions table
CREATE TABLE IF NOT EXISTS mantra_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mantra_id UUID NOT NULL REFERENCES mantras(id) ON DELETE CASCADE,
    count INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mantras_user_id ON mantras(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON mantra_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mantra_id ON mantra_sessions(mantra_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON mantra_sessions(date);