import app from './app.js';
import { runMigrations } from './config/migrate.js';
import db from './config/db.js';
import env from './config/env.js';

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    // Automatically ensure migrations have run
    await runMigrations();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 StoreRate API`);
      console.log(`📡 Listening on: http://localhost:${PORT}`);
      console.log(`🗄️  Database Dialect: MySQL`);
      console.log(`===============================================`);
    });

    const shutdown = async () => {
      console.log('\nGracefully shutting down server...');
      server.close(async () => {
        try {
          await db.close();
          console.log('Database connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error closing database connection pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
