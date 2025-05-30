import { NextRequest, NextResponse } from "next/server";
import { UsersRepository } from "@/lib/repository/users-repository";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UsersRepository.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=EmailExists`, request.url)
      );
    }

    // Create user
    const user = await UsersRepository.createUser({
      email,
      password,
      name,
      role,
    });

    // If user is a recruiter, create recruiter profile
    if (role === "recruiter") {
      await UsersRepository.createRecruiterProfile(user.id, {
        company: "",
        position: "",
      });
    }

    return NextResponse.redirect(
      new URL(`/auth/login?success=AccountCreated`, request.url)
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.redirect(
      new URL(`/auth/signup?error=ServerError`, request.url)
    );
  }
}
