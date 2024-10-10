import { PrismaClient } from '@prisma/client'
import "server-only"

declare global {
   
  let cachedPrisma: PrismaClient | undefined
}

let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // @ts-expect-error This is expected to fail because the function
  if (!global.cachedPrisma) {
    // @ts-expect-error This is expected to fail because the function
    global.cachedPrisma = new PrismaClient()
  }
  // @ts-expect-error This is expected to fail because the function
  prisma = global.cachedPrisma
}

export default prisma
