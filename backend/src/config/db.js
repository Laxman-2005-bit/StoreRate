import mysql from 'mysql2/promise';
import env from './env.js';

function getRawConfig() {
  if (env.DATABASE_URL && env.DATABASE_URL.startsWith('mysql')) {
    try {
      const url = new URL(env.DATABASE_URL);
      return {
        host: url.hostname || 'localhost',
        port: parseInt(url.port || '3306', 10),
        user: decodeURIComponent(url.username || 'root'),
        password: decodeURIComponent(url.password || ''),
        database: url.pathname.replace(/^\//, '') || 'storerate',
      };
    } catch {
      // fallback
    }
  }

  return {
    host: env.DB_HOST || 'localhost',
    port: env.DB_PORT || 3306,
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'storerate',
  };
}

const config = getRawConfig();

/**
 * Ensure MySQL database exists before creating the main connection pool
 */
export async function ensureDatabaseExists() {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
  } catch (err) {
    console.warn(`[MySQL Auto-Init] Notice: Could not pre-create database "${config.database}":`, err.message);
  }
}

export const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  multipleStatements: true,
});

/**
 * Execute SQL query against MySQL database.
 * Supports both standard MySQL `?` placeholders and `$1, $2` PostgreSQL-style placeholders.
 * 
 * @param {string} text - SQL statement
 * @param {Array} params - Parameter values
 * @returns {Promise<{rows: Array, rowCount: number, insertId: number|undefined}>}
 */
export const query = async (text, params = []) => {
  try {
    // Normalize $1, $2, $3 placeholders into ? for MySQL
    let normalizedSql = text;
    if (params && params.length > 0 && /\$\d+/.test(normalizedSql)) {
      normalizedSql = normalizedSql.replace(/\$\d+/g, '?');
    }

    const [result] = await pool.query(normalizedSql, params);

    // If result is an Array (SELECT query)
    if (Array.isArray(result)) {
      return {
        rows: result,
        rowCount: result.length,
        insertId: undefined,
      };
    }

    // If result is a ResultSetHeader (INSERT, UPDATE, DELETE)
    return {
      rows: [],
      rowCount: result.affectedRows || 0,
      insertId: result.insertId || undefined,
    };
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`[MySQL Error] Database "${config.database}" does not exist. Creating it automatically...`);
      await ensureDatabaseExists();
      // Retry once after creating database
      const [retryResult] = await pool.query(text, params);
      if (Array.isArray(retryResult)) {
        return { rows: retryResult, rowCount: retryResult.length, insertId: undefined };
      }
      return { rows: [], rowCount: retryResult.affectedRows || 0, insertId: retryResult.insertId || undefined };
    }

    console.error(`[MySQL Query Error] Query: "${text}" | Error:`, error.message);
    throw error;
  }
};

/**
 * Gracefully close MySQL connection pool
 */
export const close = async () => {
  await pool.end();
};

export default {
  query,
  pool,
  close,
  ensureDatabaseExists,
};
