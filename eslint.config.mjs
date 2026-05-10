import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**", "out/**"],
  },
];

export default config;
