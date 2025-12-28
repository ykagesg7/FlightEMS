declare module '*.mdx' {
  import React from 'react';
  const MDXComponent: React.ComponentType;
  export default MDXComponent;
}

declare module 'animejs' {
  interface AnimeParams {
    targets?: string | object | HTMLElement | NodeList | Array<string | object | HTMLElement>;
    [key: string]: any;
  }

  interface AnimeInstance {
    play: () => void;
    pause: () => void;
    restart: () => void;
    reverse: () => void;
    seek: (time: number) => void;
    [key: string]: any;
  }

  function anime(params: AnimeParams): AnimeInstance;
  export default anime;
}
