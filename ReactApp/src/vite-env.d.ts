/* eslint-disable @typescript-eslint/naming-convention */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string;
  readonly VITE_GRAPHQL_WEBSOCKET_URL: string;
  readonly VITE_AZURE_TENANT_ID: string;
  readonly VITE_AZURE_CLIENT_ID: string;
  //readonly VITE_AZURE_REDIRECT_URI: string;
  readonly VITE_AZURE_SCOPES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
