import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't auto-generate AGENTS.md/CLAUDE.md files on every dev/build run.
  agentRules: false,
};

export default nextConfig;
