import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Analysis } from "@/lib/db/schema";
import { JobRequirement } from "@/types/job-requirements";

async function generateCoverLetterContent(
  analysis: Analysis, 
  requirement: JobRequirement,
  candidateName: string
): Promise<string> {
  // Create a structured prompt for the cover letter
  const skillsArray = Array.isArray(analysis.skills) ? analysis.skills as { skill: string }[] : [];
  const matchingSkills = skillsArray
    .filter(skill => 
      requirement.primarySkills.includes(skill.skill) ||
      requirement.secondarySkills.includes(skill.skill)
    )
    .map(skill => skill.skill);

  const prompt = `
Given the following information, generate a professional cover letter:

Job Title: ${requirement.title}
Candidate Name: ${candidateName}
Experience Level: ${analysis.experienceLevel} (${analysis.workExperienceYears} years)
Matching Skills: ${matchingSkills.join(", ")}

Professional Summary:
${analysis.professionalProfile || analysis.summary}

Requirements Primary Skills: ${requirement.primarySkills.join(", ")}
Requirements Secondary Skills: ${requirement.secondarySkills.join(", ")}

Generate a cover letter that:
1. Is professionally formatted
2. Highlights the candidate's relevant experience
3. Specifically mentions matching skills
4. Shows enthusiasm for the role
5. Demonstrates understanding of the job requirements
`;

  try {
    // You can integrate with your preferred AI service here (OpenAI, Gemini, etc.)
    // For now, we'll return a template
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${requirement.title} position. As a ${analysis.experienceLevel} professional with ${analysis.workExperienceYears} years of experience, I am excited about the opportunity to contribute my expertise to your team.

${analysis.professionalProfile || analysis.summary}

My technical skills align well with your requirements, particularly in ${matchingSkills.slice(0, 3).join(", ")}, and ${matchingSkills.slice(3).join(", ")}. I am confident that my experience and capabilities make me an ideal candidate for this role.

I am particularly drawn to this position because it allows me to leverage my expertise in ${requirement.primarySkills.slice(0, 2).join(" and ")}. My background in these areas, combined with my experience, positions me well to make meaningful contributions to your team.

I look forward to discussing how my skills and experience align with your needs in more detail.

Best regards,
${candidateName}`;
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { analysis, requirement, candidateName } = body;

    if (!analysis || !requirement || !candidateName) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const coverLetter = await generateCoverLetterContent(
      analysis,
      requirement,
      candidateName
    );

    return NextResponse.json({
      success: true,
      coverLetter
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
