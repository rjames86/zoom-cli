declare module 'node-osascript' {
  interface OSAScript {
    execute(script: string, callback: (error: Error | null, result?: any) => void): void;
  }

  const osascript: OSAScript;
  export default osascript;
}