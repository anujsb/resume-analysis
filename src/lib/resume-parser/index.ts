import { readFile } from "fs/promises";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export async function parseResumeFile(filePath: string, fileType: string): Promise<string> {
  try {
    const buffer = await readFile(filePath);
    
    // Parse based on file type
    if (fileType.includes('pdf')) {
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } 
    else if (fileType.includes('docx') || fileType.includes('doc')) {
      const docData = await mammoth.extractRawText({ buffer });
      return docData.value;
    }
    else if (fileType.includes('text') || fileType.includes('plain')) {
      // Plain text file
      return buffer.toString('utf-8');
    }
    else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error("Error parsing resume file:", error);
    throw new Error(`Failed to parse resume file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}