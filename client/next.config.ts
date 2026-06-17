import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a minimal, self-contained server bundle for Docker/self-hosting.
  output: "standalone",
  // We live in a monorepo subfolder; trace files from the repo root so the
  // standalone output includes everything it needs (Next 16 defaults the
  // tracing root to this folder otherwise).
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;
