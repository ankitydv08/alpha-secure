import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Session pooler (port 5432) — used by Prisma CLI for db push/migrate
    // Runtime uses DATABASE_URL (transaction pooler, port 6543) via PrismaClient adapter
    url: env("DIRECT_URL"),
  },
});
