/// <reference types="vite/client" />

interface ImportMeta {
  readonly glob: (
    pattern: string | string[],
    options?: {
      query?: string;
      import?: string;
      eager?: boolean;
      as?: string;
    }
  ) => Record<string, unknown>;
}
