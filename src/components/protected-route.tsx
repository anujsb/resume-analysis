'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user?.role && !allowedRoles.includes(session.user.role)) {
      if (session.user.role === "candidate") {
        router.push("/profile");
      } else if (session.user.role === "recruiter") {
        router.push("/dashboard");
      }
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || (session.user?.role && !allowedRoles.includes(session.user.role))) {
    return null;
  }

  return <>{children}</>;
}
