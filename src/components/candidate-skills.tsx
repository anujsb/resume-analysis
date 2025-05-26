import { Badge } from "@/components/ui/badge";
import { SkillProficiency } from "@/types/candidate";

interface CandidateSkillsProps {
  skills: SkillProficiency[];
}

export function CandidateSkills({ skills }: CandidateSkillsProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    const level = skill.proficiency;
    if (!acc[level]) acc[level] = [];
    acc[level].push(skill);
    return acc;
  }, {} as Record<string, SkillProficiency[]>);

  const levels = ["expert", "advanced", "intermediate", "beginner"];
  const levelColors = {
    expert: "bg-purple-100 text-purple-800",
    advanced: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    beginner: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="space-y-6 p-4">
      {levels.map(level => groupedSkills[level]?.length > 0 && (
        <div key={level} className="space-y-2">
          <h3 className="font-semibold capitalize">{level}</h3>
          <div className="flex flex-wrap gap-2">
            {groupedSkills[level].map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className={levelColors[skill.proficiency as keyof typeof levelColors]}
              >
                {skill.skill}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}