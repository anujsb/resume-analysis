// src/app/api/analyze-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock analysis function - replace with your actual AI analysis
async function analyzeResumeText(resumeText: string) {
  // This is a mock implementation
  // Replace this with your actual AI analysis logic
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock analysis result
  return {
    skills: [
      { skill: "JavaScript", proficiency: "Advanced" },
      { skill: "React", proficiency: "Advanced" },
      { skill: "Node.js", proficiency: "Intermediate" },
      { skill: "TypeScript", proficiency: "Intermediate" },
      { skill: "SQL", proficiency: "Intermediate" },
    ],
    experienceLevel: "senior",
    workExperienceYears: "5",
    summary: `Experienced software developer with ${Math.floor(Math.random() * 5) + 3} years of experience in full-stack development. 
    
Proficient in modern web technologies including React, Node.js, and TypeScript. Strong background in database design and API development. 

Key achievements include:
• Led development of multiple web applications
• Improved application performance by 40%
• Mentored junior developers
• Implemented CI/CD pipelines

Passionate about clean code, user experience, and continuous learning. Looking for opportunities to contribute to innovative projects and grow technical expertise.`,
    phone: extractPhoneNumber(resumeText),
  };
}

function extractPhoneNumber(text: string): string {
  // Simple phone number extraction
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
  const match = text.match(phoneRegex);
  return match ? match[0] : "";
}

async function extractTextFromFile(file: File): Promise<string> {
  // This is a simplified implementation
  // For production, you'd want to use proper libraries like:
  // - pdf-parse for PDFs
  // - mammoth for Word documents
  // - etc.
  
  if (file.type === 'text/plain') {
    return await file.text();
  }
  
  // For other file types, you'd implement proper extraction
  // This is just a placeholder
  return `[Resume content from ${file.name}]
  
John Doe
Software Engineer
Email: john@example.com
Phone: (555) 123-4567

EXPERIENCE:
Senior Software Developer (2019-2024)
- Developed and maintained web applications using React and Node.js
- Led a team of 3 developers
- Implemented automated testing procedures
- Improved application performance by 40%

SKILLS:
- JavaScript/TypeScript
- React, Angular, Vue.js
- Node.js, Express
- MongoDB, PostgreSQL
- Docker, AWS
- Git, CI/CD

EDUCATION:
Bachelor's in Computer Science
University of Technology (2015-2019)`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, Word, or text files only." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Extract text from file
    const resumeText = await extractTextFromFile(file);
    
    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the uploaded file." },
        { status: 400 }
      );
    }

    // Analyze the resume text
    const analysis = await analyzeResumeText(resumeText);
    
    return NextResponse.json({
      success: true,
      analysis,
      resumeText,
      message: "Resume analyzed successfully"
    });
    
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}