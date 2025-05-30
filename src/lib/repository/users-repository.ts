import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { NewUser, User, users, recruiters, NewRecruiter, candidates } from "@/lib/db/schema";
import * as bcrypt from "bcrypt";

export class UsersRepository {
  static async createUser(data: Omit<NewUser, "id" | "createdAt">): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  static async createRecruiterProfile(userId: number, data: Omit<NewRecruiter, "id" | "userId" | "createdAt">) {
    const [recruiter] = await db
      .insert(recruiters)
      .values({
        ...data,
        userId,
      })
      .returning();
    
    return recruiter;
  }

  static async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    return user;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static async getUserProfile(userId: number, role: "candidate" | "recruiter") {
    if (role === "candidate") {
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, userId));
      return candidate;
    } else {
      const [recruiter] = await db
        .select()
        .from(recruiters)
        .where(eq(recruiters.userId, userId));
      return recruiter;
    }
  }
}
