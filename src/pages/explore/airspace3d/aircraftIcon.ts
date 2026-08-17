/** glTF は +X が機首。Cesium の HeadingPitchRoll と合わせる。 */
function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.byteLength, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.byteLength;
  }
  return out;
}

function floatsToBytes(values: number[]): Uint8Array {
  const buf = new ArrayBuffer(values.length * 4);
  new Float32Array(buf).set(values);
  return new Uint8Array(buf);
}

function ushortsToBytes(values: number[]): Uint8Array {
  const buf = new ArrayBuffer(values.length * 2);
  new Uint16Array(buf).set(values);
  return new Uint8Array(buf);
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]!);
  }
  if (typeof btoa === 'function') return btoa(bin);
  return Buffer.from(bytes).toString('base64');
}

/**
 * Cesium の HeadingPitchRoll は heading 0 で ENU の +X（東）に機首が向く。
 * 航跡の真方位 0（北）と合わせるため -90°。
 */
export const AIRCRAFT_YAW_OFFSET_DEG = -90;

export function playbackHeadingToModelHeadingDeg(headingDeg: number): number {
  const h = headingDeg + AIRCRAFT_YAW_OFFSET_DEG;
  return ((h % 360) + 360) % 360;
}

/**
 * 小さな 3D 機体（機首先端が +X）。data: URI の glTF。
 */
export function createAircraftGltfDataUri(): string {
  // dart in glTF Y-up: nose +X, wings ±Z, fin +Y
  const positions = [
    8, 0, 0, // 0 nose
    -4, 0, -5.5, // 1 left
    -4, 0, 5.5, // 2 right
    -4, 2.4, 0, // 3 fin
    -4, -0.7, 0, // 4 belly
  ];
  const indices = [
    0, 1, 3, 0, 3, 2, 0, 2, 4, 0, 4, 1, 1, 4, 2, 1, 2, 3,
  ];
  const posBytes = floatsToBytes(positions);
  const idxBytes = ushortsToBytes(indices);
  const pad = idxBytes.byteLength % 4 === 0 ? 0 : 4 - (idxBytes.byteLength % 4);
  const bin = concatBytes([posBytes, idxBytes, new Uint8Array(pad)]);

  const gltf = {
    asset: { version: '2.0', generator: 'FlightAcademy explore aircraft' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 1,
            mode: 4,
          },
        ],
      },
    ],
    buffers: [
      {
        uri: `data:application/octet-stream;base64,${toBase64(bin)}`,
        byteLength: bin.byteLength,
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes.byteLength, target: 34962 },
      { buffer: 0, byteOffset: posBytes.byteLength, byteLength: idxBytes.byteLength, target: 34963 },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 5,
        type: 'VEC3',
        min: [-4, -0.7, -5.5],
        max: [8, 2.4, 5.5],
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: indices.length,
        type: 'SCALAR',
      },
    ],
  };

  return `data:model/gltf+json;charset=utf-8,${encodeURIComponent(JSON.stringify(gltf))}`;
}

/** 機首が上。Cesium Billboard の rotation（時計回りラジアン）。 */
export function headingDegToBillboardRotation(headingDeg: number): number {
  return -((headingDeg * Math.PI) / 180);
}
