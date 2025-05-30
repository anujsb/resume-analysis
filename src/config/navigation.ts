// // src/config/navigation.ts
import { HomeIcon, BriefcaseIcon, UsersIcon, BarChartIcon, UserIcon, MessagesSquareIcon } from "lucide-react";

export const recruiterNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    description: "Overview and resume upload"
  },
  {
    title: "Job Requirements",
    href: "/requirements",
    icon: BriefcaseIcon,
    description: "Manage job requirements"
  },
  {
    title: "Candidates",
    href: "/candidates",
    icon: UsersIcon,
    description: "View and analyze candidates"
  },
  {
    title: "Interview",
    href: "/interview",
    icon: MessagesSquareIcon,
    description: "Conduct interviews"
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChartIcon,
    description: "View recruitment analytics"
  }
];

export const candidateNavigation = [
  {
    title: "Profile",
    href: "/profile",
    icon: UserIcon,
    description: "View and update profile"
  }
];