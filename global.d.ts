declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
declare module '*.ttf';
declare module '*.woff';
declare module '*.woff2';
declare module '*.less';
declare module '*.md';
declare module '*.glb';
declare module '*.gltf';

declare namespace NodeJS {
  interface ProcessEnv {
    /** 构建时间 */
    BUILD_TIME: string;
    /** 环境 */
    NODE_ENV: 'development' | 'production';
    /** 版本号 */
    APP_VERSION: string;
  }
}