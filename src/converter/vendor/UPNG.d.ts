export interface UPNGImage {
  width: number;
  height: number;
  depth: number;
  ctype: number;
  frames: Array<{
    rect: { x: number; y: number; width: number; height: number };
    delay: number;
    blend: number;
    dispose: number;
    data: Uint8Array;
  }>;
  tabs: Record<string, any>;
}

export declare function decode(buff: ArrayBuffer): UPNGImage;
export declare function toRGBA8(out: UPNGImage): ArrayBuffer[];
export declare function encode(
  imgs: ArrayBuffer[],
  w: number,
  h: number,
  cnum: number,
  dels?: number[]
): ArrayBuffer;