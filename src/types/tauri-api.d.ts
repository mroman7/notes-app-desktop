// Minimal module declaration to satisfy TypeScript when the @tauri-apps/api
// package types are not picked up by the compiler in this environment.
declare module '@tauri-apps/api/core' {
  export function invoke<T = any>(cmd: string, args?: any, options?: any): Promise<T>;
}

declare module '@tauri-apps/api' {
  export * from '@tauri-apps/api/core';
}
