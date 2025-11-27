import { getConfig } from "../utils/get-config";

const { dateType } = await getConfig();

const payload = `
  interface Payload<T> {
    data: T;
    error?: {
        status: number,
        name: 'NotFoundError',
        message: 'Not Found',
        details: unknown
    };
    meta?: {
      pagination?: {
        page: number; 
        pageSize: number;
        pageCount: number;
        total: number;
      }
    };
  }
`;

const mediaFormat = `
  interface MediaFormat {
    name?: string;
    hash?: string;
    ext?: string;
    mime?: string;
    width?: number;
    height?: number;
    size?: number;
    path?: string;
    url?: string;
    sizeInBytes?: number
  }
`;

const media = `
  interface Media {
    id?: number;
    name?: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
    formats?: { thumbnail: MediaFormat; medium: MediaFormat; small: MediaFormat; };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url?: string;
    previewUrl?: string;
    provider?: string;
    createdAt?: ${dateType};
    updatedAt?: ${dateType};
    publishedAt?: ${dateType};
    provider_metadata?: unknown
  }
`;

export const strapiInterfaces: string[] = [payload, mediaFormat, media].filter(
  (s) => typeof s === "string"
);
