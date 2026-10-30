import env from '#start/env'
import { resolvePostgresSsl } from '#services/postgres_ssl'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

/**
 * SQLite stays the default for `NODE_ENV=development` and `NODE_ENV=test`
 * so local `npm run dev` and CI do not need Postgres.
 * Production (Railway) uses the `pg` connection unless DB_CONNECTION overrides it.
 */
const connectionName = env.get('DB_CONNECTION') ?? (app.inProduction ? 'pg' : 'sqlite')

function postgresConnection() {
  const databaseUrl = env.get('DATABASE_URL')
  const explicitSsl = env.get('DB_SSL')

  if (databaseUrl) {
    return {
      connectionString: databaseUrl,
      ssl: resolvePostgresSsl(databaseUrl, explicitSsl),
    }
  }

  const host = env.get('DB_HOST')
  const port = env.get('DB_PORT')
  const user = env.get('DB_USER')
  const password = env.get('DB_PASSWORD')
  const database = env.get('DB_DATABASE')

  if (connectionName === 'pg') {
    const missing = [
      ['DB_HOST', host],
      ['DB_PORT', port],
      ['DB_USER', user],
      ['DB_PASSWORD', password],
      ['DB_DATABASE', database],
    ]
      .filter((entry) => entry[1] === undefined)
      .map((entry) => entry[0])

    if (missing.length > 0) {
      throw new Error(
        `PostgreSQL requires DATABASE_URL, or ${missing.join(', ')}. Set the Railway Postgres DATABASE_URL reference on the API service.`
      )
    }
  }

  return {
    host: host ?? '127.0.0.1',
    port: port ?? 5432,
    user: user ?? 'postgres',
    password: password ?? '',
    database: database ?? 'linkstream',
    ssl: resolvePostgresSsl(undefined, explicitSsl),
  }
}

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  connection: connectionName,

  connections: {
    /**
     * SQLite connection (local development and tests).
     */
    sqlite: {
      client: 'better-sqlite3',

      connection: {
        filename: app.tmpPath('db.sqlite3'),
      },

      /**
       * Required by Knex for SQLite defaults.
       */
      useNullAsDefault: true,

      migrations: {
        /**
         * Sort migration files naturally by filename.
         */
        naturalSort: true,

        /**
         * Paths containing migration files.
         */
        paths: ['database/migrations'],
      },

      schemaGeneration: {
        /**
         * Enable schema generation from Lucid models.
         */
        enabled: true,

        /**
         * Custom schema rules file paths.
         */
        rulesPaths: ['./database/schema_rules.js'],
      },
    },

    /**
     * PostgreSQL connection (Railway and any other hosted Postgres).
     * Prefer DATABASE_URL. DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_DATABASE
     * are the fallback when a URL is not set.
     */
    pg: {
      client: 'pg',
      connection: postgresConnection(),
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },

    /**
     * MySQL / MariaDB connection.
     * Install package to switch: npm install mysql2
     */
    // mysql: {
    //   client: 'mysql2',
    //   connection: {
    //     host: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * Microsoft SQL Server connection.
     * Install package to switch: npm install tedious
     */
    // mssql: {
    //   client: 'mssql',
    //   connection: {
    //     server: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * libSQL (Turso) connection.
     * Install package to switch: npm install @libsql/client
     */
    // libsql: {
    //   client: 'libsql',
    //   connection: {
    //     url: env.get('LIBSQL_URL'),
    //     authToken: env.get('LIBSQL_AUTH_TOKEN'),
    //   },
    //   useNullAsDefault: true,
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },
  },
})

export default dbConfig
