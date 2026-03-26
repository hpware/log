CREATE TABLE IF NOT EXISTS video_encoding_jobs (
  job_id TEXT PRIMARY KEY,
  source_url TEXT NOT NULL,
  output_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  CONSTRAINT status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);