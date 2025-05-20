import { HomeIcon, BriefcaseIcon, UsersIcon, BarChartIcon } from "lucide-react"

export const navigation = [
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
    title: "Reports",
    href: "/reports",
    icon: BarChartIcon,
    description: "View recruitment analytics"
  }
]