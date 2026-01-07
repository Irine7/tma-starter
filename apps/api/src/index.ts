import dotenv from 'dotenv';
import path from 'path';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express, { Application } from 'express';
import { corsMiddleware } from './middleware/cors';
import {
  validateTelegramData,
  optionalTelegramData,
} from './middleware/validateTelegramData';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ===========================================
// Middleware
// ===========================================

// Enable CORS for frontend communication
app.use(corsMiddleware());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ===========================================
// Routes
// ===========================================

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// Auth routes (Telegram authentication)
app.use('/auth', authRoutes);

// Example: Protected route with Telegram validation
// app.use('/api/user', validateTelegramData, userRoutes);

// Example: Route with optional Telegram data
// app.use('/api/public', optionalTelegramData, publicRoutes);

// ===========================================
// API Info Route
// ===========================================

app.get('/', (_req, res) => {
  res.json({
    name: 'TMA Boilerplate API',
    version: '1.0.0',
    description: 'Telegram Mini App Backend Server',
    endpoints: {
      health: '/health',
      healthReady: '/health/ready',
      healthLive: '/health/live',
    },
    documentation: 'https://github.com/your-repo/tma-boilerplate',
  });
});

// ===========================================
// Error Handling
// ===========================================

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
      },
      timestamp: Date.now(),
    });
  }
);

// ===========================================
// Start Server
// ===========================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 TMA Boilerplate API Server');
  console.log('============================');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('');

  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️  Running in DEVELOPMENT mode');
    console.log('   Telegram initData validation is relaxed');
    console.log('');
  }
});

// Export for testing
export default app;
