import type { Core } from '@strapi/strapi';

export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database<'postgres'> => ({
  connection: {
    client: 'postgres',
    connection: {
      connectionString: env('DATABASE_URL'),
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'lumea'),
      user: env('DATABASE_USERNAME', 'lumea'),
      password: env('DATABASE_PASSWORD', ''),
      schema: env('DATABASE_SCHEMA', 'public'),
      ssl: env.bool('DATABASE_SSL', false) && {
        ca: env('DATABASE_SSL_CA', undefined),
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
    },
    pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
  },
});
