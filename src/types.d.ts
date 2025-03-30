// Type declarations for various file types

// Allow importing image files
declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

// Allow importing CSS files
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Chrome extension API types if not provided by DefinitelyTyped
interface Chrome {
  runtime: any;
  tabs: any;
  storage: any;
  declarativeNetRequest: any;
  webNavigation: any;
}

declare var chrome: Chrome; 