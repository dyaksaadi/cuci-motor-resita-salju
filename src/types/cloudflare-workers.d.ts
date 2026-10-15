declare module "cloudflare:workers" {
  export const env: {
    AUTH_SECRET: string;
    HYPERDRIVE: {
      connectionString: string;
    };
  };
}
