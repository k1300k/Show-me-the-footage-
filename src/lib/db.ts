import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_HOST || 'cctvdb1.ktict.co.kr',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'user_hdauto',
  password: process.env.DB_PASSWORD || 'e(oYgFXQ)UYW6(%N',
  database: process.env.DB_NAME || 'cctv',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 15000,
  requestTimeout: 15000,
};

let pool: sql.ConnectionPool | null = null;

export async function getDbPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

export async function closeDbPool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };


