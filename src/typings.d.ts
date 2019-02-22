/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}
declare module '*.json' {
    const value: any;
    export default value;
}

declare module 'granim';

declare module 'quill';
declare module 'leaflet';
declare module 'perfect-scrollbar';
declare module 'screenfull';
declare module 'd3-shape';
