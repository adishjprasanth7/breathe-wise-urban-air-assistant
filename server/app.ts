import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { assistantRequestSchema } from './validation.js';
import { buildFallbackAssistantResponse } from './fallback.js';
import { callGeminiAssistant } from './gemini.js';

export interface AppConfig {
  frontendUrl?: string;
  geminiApiKey?: string;
  rateLimitMax?: number;
}

export function createApp(config: AppConfig = {}) {
  const app = express();

  const allowedOrigins = (config.frontendUrl ?? process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // Apply CORS allowlist strictly to /api routes (never block static frontend assets)
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const host = req.get('host');
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        const normalizedOrigin = origin.replace(/\/+$/, '');
        const isSameHost =
          Boolean(host) &&
          (normalizedOrigin === `https://${host}` || normalizedOrigin === `http://${host}`);

        if (isSameHost || allowedOrigins.includes(normalizedOrigin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed by CORS policy'));
      },
      methods: ['GET', 'POST'],
    })(req, res, next);
  });

  app.use(express.json({ limit: '16kb' }));

  const assistantLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.rateLimitMax ?? 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many assistant requests. Please wait a few minutes before trying again.',
    },
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const apiKey = config.geminiApiKey ?? process.env.GEMINI_API_KEY;
    res.json({
      status: 'ok',
      aiConfigured: Boolean(apiKey && apiKey.trim().length > 0),
      timestamp: new Date().toISOString(),
    });
  });

  app.post('/api/assistant', assistantLimiter, async (req: Request, res: Response) => {
    const parsed = assistantRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid request payload.',
        details: parsed.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const apiKey = (config.geminiApiKey ?? process.env.GEMINI_API_KEY ?? '').trim();

    if (!apiKey) {
      res.json(buildFallbackAssistantResponse(parsed.data));
      return;
    }

    try {
      const aiResult = await callGeminiAssistant(parsed.data, apiKey);
      res.json(aiResult);
    } catch {
      // Never log API keys or raw user payloads; fall back deterministically
      res.json(buildFallbackAssistantResponse(parsed.data));
    }
  });

  // Serve built Vite frontend when dist/ exists (single-service deployment e.g. Render)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Sanitized error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    if (err.message.includes('CORS')) {
      res.status(403).json({ error: 'Cross-origin request denied.' });
      return;
    }
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  return app;
}
