import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.100:5000', 'http://192.168.1.100:8081'],
  credentials: true
}));

app.use(express.json());

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Test endpoint
app.get('/users', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
