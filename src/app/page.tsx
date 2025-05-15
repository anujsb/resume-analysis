import { ResumeUpload } from "@/components/resume-upload";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Resume Analyzer for Recruiters</h1>
        <p className="text-lg text-gray-600 mb-12 text-center">
          Upload candidate resumes to get AI-powered analysis of skills, experience level, and more.
        </p>
        
        <ResumeUpload />
      </div>
    </main>
  );
}