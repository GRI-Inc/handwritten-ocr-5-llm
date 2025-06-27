declare module 'pdf-img-convert' {
  interface ConvertOptions {
    width?: number;
    height?: number;
    base64?: boolean;
    page?: number;
  }

  export function convert(
    // eslint-disable-next-line no-unused-vars
    pdfPath: string,
    // eslint-disable-next-line no-unused-vars
    options?: ConvertOptions
  ): Promise<string[] | Buffer[]>;
}