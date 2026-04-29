import 'dotenv/config'
import pg from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { Database } from './schema'

function parseDatabaseUrl(rawConnectionString?: string): pg.PoolConfig {
  if (!rawConnectionString) {
    return {}
  }

  const protocolSeparator = '://'
  const protocolEnd = rawConnectionString.indexOf(protocolSeparator)
  if (protocolEnd === -1) {
    return { connectionString: rawConnectionString }
  }

  const authorityStart = protocolEnd + protocolSeparator.length
  const pathStart = rawConnectionString.indexOf('/', authorityStart)

  if (pathStart === -1) {
    return { connectionString: rawConnectionString }
  }

  const authority = rawConnectionString.slice(authorityStart, pathStart)
  const lastAt = authority.lastIndexOf('@')
  if (lastAt === -1) {
    return { connectionString: rawConnectionString }
  }

  const userInfo = authority.slice(0, lastAt)
  const hostInfo = authority.slice(lastAt + 1)
  const firstColon = userInfo.indexOf(':')

  if (firstColon === -1) {
    return { connectionString: rawConnectionString }
  }

  const user = userInfo.slice(0, firstColon)
  const password = userInfo.slice(firstColon + 1)
  const hostParts = hostInfo.split(':')
  const host = hostParts[0]
  const port = hostParts[1] ? Number(hostParts[1]) : undefined
  const databaseWithParams = rawConnectionString.slice(pathStart + 1)
  const [database] = databaseWithParams.split('?')

  return {
    user,
    password,
    host,
    port,
    database,
    ssl: { rejectUnauthorized: false },
  }
}

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    ...parseDatabaseUrl(process.env.DATABASE_URL),
    max: 10,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
