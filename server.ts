import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import pool from './src/db.ts';

// Routes
import authRoutes from './src/routes/authRoutes.ts';
import menuRoutes from './src/routes/menuRoutes.ts';
import orderRoutes from './src/routes/orderRoutes.ts';
import reservationRoutes from './src/routes/reservationRoutes.ts';
import deliveryRoutes from './src/routes/deliveryRoutes.ts';
import paymentRoutes from './src/routes/paymentRoutes.ts';
import slideRoutes from './src/routes/slideRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('Running migrations from schema.sql...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    
    // Ensure slides table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slides (
          id SERIAL PRIMARY KEY,
          photo_url TEXT NOT NULL,
          titre VARCHAR(255),
          description TEXT,
          ordre INTEGER DEFAULT 0,
          actif BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Update orders.status constraint if needed
    await pool.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
      ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('en attente', 'en préparation', 'en route', 'livré', 'annulé'));
      
      ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
      ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (status IN ('en_attente', 'confirmé', 'rejeté', 'annulé', 'terminé'));
      
      -- Set default value for status
      ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'en_attente';
      
      -- Update existing confirmed reservations to en_attente as requested
      UPDATE reservations SET status = 'en_attente' WHERE status = 'confirmé' OR status = 'en attente';
    `);

    // Insert default slides if none exist
    const slidesCheck = await pool.query('SELECT COUNT(*) FROM slides');
    if (parseInt(slidesCheck.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO slides (photo_url, titre, description, ordre, actif)
        VALUES 
        ('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000', 'L''Érable Rouge', 'Une expérience culinaire unique à Agadir.', 1, true),
        ('https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=2000', 'Saveurs Authentiques', 'Des produits frais sélectionnés avec soin.', 2, true);
      `);
    }

    // Ensure at least one admin exists
    const adminCheck = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      console.log('No admin found. Creating default admin user...');
      const adminEmail = 'admin@erable-rouge.com';
      const adminPassword = 'admin_password_2026';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await pool.query(
        "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, 'admin')",
        [adminEmail, hashedPassword, 'Admin', 'L\'Érable Rouge']
      );
      console.log(`Default admin created: ${adminEmail} / ${adminPassword}`);
    }
    
    console.log('Migration successful: All tables ensured.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Run migrations
  await migrate();

  // Trust proxy for rate limiting (needed behind Cloud Run/Nginx)
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development with Vite
  }));

  // Simple and reliable CORS configuration
  const allowedOrigins = [
    'https://lerablerouge.com',
    'https://www.lerablerouge.com',
    'https://l-rable-rouge.vercel.app'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith('.vercel.app') || 
                        origin.endsWith('.run.app') || 
                        origin.includes('localhost') || 
                        origin.includes('127.0.0.1');

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocage de l'origine : ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.'
  });
  app.use('/api/', limiter);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/deliveries', deliveryRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/slides', slideRoutes);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
