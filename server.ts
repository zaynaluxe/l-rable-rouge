import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import pool from './src/db.ts';

// Routes
import authRoutes from './src/routes/authRoutes.ts';
import menuRoutes from './src/routes/menuRoutes.ts';
import orderRoutes from './src/routes/orderRoutes.ts';
import reservationRoutes from './src/routes/reservationRoutes.ts';
import deliveryRoutes from './src/routes/deliveryRoutes.ts';
import paymentRoutes from './src/routes/paymentRoutes.ts';
import slideRoutes from './src/routes/slideRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('Running migrations from schema.sql...');
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    
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
    
    console.log('Migration successful: All tables ensured.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Run migrations
  await migrate();

  // Trust proxy for rate limiting (needed behind Cloud Run/Nginx)
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development with Vite
  }));
  app.use(cors());
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
    res.json({ status: 'ok', message: 'Backend L\'Érable Rouge is running' });
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
