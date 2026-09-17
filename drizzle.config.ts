import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.local",
});

export default defineConfig({
  schema: "./db/schema.ts",

  out: "./drizzle",

  dialect: "mysql",

  dbCredentials: {
    // La generación de migraciones no se conecta a MySQL. Para aplicar cambios,
    // DATABASE_URL debe apuntar a la instancia real en .env.local.
    url:
      process.env.DATABASE_URL ??
      process.env.MYSQL_URL ??
      "mysql://aulaenlace:aulaenlace@127.0.0.1:3306/aulaenlace",
  },

  verbose: true,

  strict: true,
});
