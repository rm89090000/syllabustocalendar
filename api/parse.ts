import pdf from "pdf-parse";

export async function parsePDFText(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}
