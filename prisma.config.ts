// import { defineConfig } from 'prisma/config'
// import { Pool } from 'pg'
// import { PrismaPg } from '@prisma/adapter-pg'

// export default defineConfig({
//   datasource: {
//     url: process.env.DATABASE_URL,
//   },
// })
import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
})