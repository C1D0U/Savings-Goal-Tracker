import path from "node:path";
import { fileURLToPath } from "node:url";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default withFlowbiteReact(nextConfig);