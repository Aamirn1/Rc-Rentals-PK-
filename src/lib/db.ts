import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

/**
 * On Vercel (and other read-only filesystem serverless hosts), the committed
 * SQLite DB at db/custom.db is read-only at runtime. Prisma SQLite needs write
 * access for its WAL/SHM journal files. We copy the DB to /tmp (writable on
 * Vercel) on first access and point DATABASE_URL there.
 *
 * In development the original path is used directly (writable).
 */
function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL || 'file:./db/custom.db'

  // Only remap on serverless read-only filesystems (Vercel production)
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    const tmpDir = '/tmp'
    const tmpDbPath = path.join(tmpDir, 'custom.db')
    const sourcePath = path.join(process.cwd(), 'db', 'custom.db')

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, tmpDbPath)
      }
      // Also copy the SQLite WAL/SHM if they exist
      for (const ext of ['-wal', '-shm']) {
        const s = sourcePath + ext
        const t = tmpDbPath + ext
        if (fs.existsSync(s) && !fs.existsSync(t)) {
          fs.copyFileSync(s, t)
        }
      }
      return `file:${tmpDbPath}`
    } catch {
      // Fallback to the configured path if /tmp copy fails
      return configured
    }
  }

  return configured
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url = resolveDatabaseUrl()
  // Set the resolved URL so Prisma uses it
  process.env.DATABASE_URL = url
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
