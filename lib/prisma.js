import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({})
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({})
  }
  prisma = globalForPrisma.prisma
}

export { prisma }

