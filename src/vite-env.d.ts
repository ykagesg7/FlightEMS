/// <reference types="vite/client" />

declare module '*.geojson' {
  const value: any;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}
