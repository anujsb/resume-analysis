// // src/lib/utils.ts
// import { type ClassValue, clsx } from "clsx";
// import { twMerge } from "tailwind-merge";
// import mammoth from "mammoth";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export async function extractTextFromFile(file: File): Promise<string> {
//   const fileType = file.type;
  
//   if (fileType === "application/pdf") {
//     return extractTextFromPdf(file);
//   } else if (
//     fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
//     fileType === "application/msword"
//   ) {
//     return extractTextFromDoc(file);
//   } else if (fileType === "text/plain") {
//     return extractTextFromTxt(file);
//   } else {
//     throw new Error(`Unsupported file type: ${fileType}`);
//   }
// }

// async function extractTextFromPdf(file: File): Promise<string> {
//   try {
//     const arrayBuffer = await file.arrayBuffer();
    
//     // Use Gemini API directly to extract text from PDF
//     // This approach leverages Gemini's ability to process PDFs without needing
//     // to store the file or use a PDF-specific library
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
//     const base64String = Buffer.from(arrayBuffer).toString("base64");

//     const fileData = {
//       inlineData: {
//         data: base64String,
//         mimeType: "application/pdf",
//       },
//     };

//     const prompt = "Extract all text from this PDF document. Return only the raw text content with proper spacing and paragraph breaks.";
    
//     const result = await model.generateContent([prompt, fileData]);
//     return result.response.text();
//   } catch (error) {
//     console.error("Failed to extract text from PDF:", error);
//     throw new Error("Failed to extract text from PDF");
//   }
// }

// async function extractTextFromDoc(file: File): Promise<string> {
//   try {
//     const arrayBuffer = await file.arrayBuffer();
//     const result = await mammoth.extractRawText({ arrayBuffer });
//     return result.value;
//   } catch (error) {
//     console.error("Failed to extract text from DOCX:", error);
//     throw new Error("Failed to extract text from DOCX");
//   }
// }

// async function extractTextFromTxt(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = () => reject(new Error("Failed to read text file"));
//     reader.readAsText(file);
//   });
// }

// // Define experience level based on years
// export function getExperienceLevel(years: number): "fresher" | "junior" | "mediocre" | "senior" {
//   if (years < 1) return "fresher";
//   if (years >= 1 && years < 3) return "junior";
//   if (years >= 3 && years < 8) return "mediocre";
//   return "senior";
// }

// // Add missing GoogleGenerativeAI import at the top
// import { GoogleGenerativeAI } from "@google/generative-ai";



// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  
  if (fileType === "application/pdf") {
    return extractTextFromPdf(file);
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    fileType === "application/msword"
  ) {
    return extractTextFromDoc(file);
  } else if (fileType === "text/plain") {
    return extractTextFromTxt(file);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use Gemini API to extract text from PDF
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "Extract all text from this PDF document. Return only the raw text content with proper spacing and paragraph breaks.";
    
    // Convert PDF to base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");
    
    // Create parts array with prompt and file data
    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64String
        }
      }
    ];
    
    const result = await model.generateContent(parts);
    return result.response.text();
  } catch (error) {
    console.error("Failed to extract text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

async function extractTextFromDoc(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Failed to extract text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

async function extractTextFromTxt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read text file"));
    reader.readAsText(file);
  });
}

// Define experience level based on years
export function getExperienceLevel(years: number): "fresher" | "junior" | "mediocre" | "senior" {
  if (years < 1) return "fresher";
  if (years >= 1 && years < 3) return "junior";
  if (years >= 3 && years < 8) return "mediocre";
  return "senior";
}