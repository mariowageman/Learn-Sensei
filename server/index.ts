import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { authRouter } from "./auth";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { rolesRouter } from "./routes/roles";
import fileUpload from 'express-fileupload';
import { setupDeployment } from './deploy-setup';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure fileupload middleware with proper error handling and file size limits
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  abortOnLimit: true,
  responseOnLimit: "File size limit exceeded (5MB)",
  useTempFiles: false,
  debug: process.env.NODE_ENV === 'development',
}));

// Configure session
const PostgresStore = connectPg(session);
app.use(session({
  store: new PostgresStore({
    pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Register auth routes
app.use(authRouter);

app.use(rolesRouter);

// Serve static files from public directory with proper MIME types
app.use(express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Also serve static files from client/public directory
app.use('/public', express.static(path.join(process.cwd(), 'client', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Debug endpoint to check if the file exists
app.get('/debug/check-logo', (req, res) => {
  const logoPath = path.join(process.cwd(), 'client', 'public', 'learn-sensei-logo-icon.png');
  const exists = fs.existsSync(logoPath);
  res.json({
    exists,
    path: logoPath,
    size: exists ? fs.statSync(logoPath).size : null
  });
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Run deployment setup if in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Running deployment setup...');
      await setupDeployment();
    }

    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const tryPort = async (port: number): Promise<number> => {
      try {
        await new Promise((resolve, reject) => {
          server.listen(port, "0.0.0.0")
            .once('listening', () => {
              server.close(() => resolve(port));
            })
            .once('error', reject);
        });
        return port;
      } catch (err) {
        if (port < 3010) {
          return tryPort(port + 1);
        }
        throw err;
      }
    };

    const PORT = process.env.PORT || await tryPort(3000);
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();