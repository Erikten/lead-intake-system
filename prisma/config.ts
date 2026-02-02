import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  dbAdapter: {
    provider: "sqlite",
    connectionString: `file:${path.resolve(__dirname, "dev.db")}`,
  },
});