import fs from 'node:fs/promises';
import path from 'node:path';

export async function readPage(relativePath: string): Promise<string> {
  const full = path.join(process.cwd(), 'pages', relativePath);
  return fs.readFile(full, 'utf8');
}
