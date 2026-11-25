// src/env.ts
// Loaded as the very first import in index.ts and auth.ts so that
// process.env is populated before any module body evaluates.
import dotenv from "dotenv";

dotenv.config();