import {
  Bot,
  Briefcase,
  Boxes,
  BookText,
  BrainCircuit,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  Palette,
  Settings,
  Target,
  type LucideIcon,
} from "lucide-react";

/**
 * Navigation is config-driven: the sidebar renders from these structures.
 * Adding a page to the menu = adding one entry here. No JSX edits required.
 */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Primary navigation, grouped into labelled sections. */
export const primaryNavigation: NavSection[] = [
  {
    title: "Platform",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview of the TITAN ecosystem.",
      },
      {
        title: "TITAN Brain",
        href: "/brain",
        icon: BrainCircuit,
        description: "The reasoning workspace that coordinates the AI workforce.",
      },
      {
        title: "Business Intake",
        href: "/business-intake",
        icon: ClipboardList,
        description: "Start onboarding: capture a business's details.",
      },
      {
        title: "Businesses",
        href: "/businesses",
        icon: Briefcase,
        description: "Every business and its journey through the pipeline.",
      },
      {
        title: "Experience Studio",
        href: "/experience-studio",
        icon: Palette,
        description: "Review a premium Experience Strategy for a business.",
      },
      {
        title: "Codex",
        href: "/codex",
        icon: BookText,
        description: "Company knowledge and intellectual property.",
      },
      {
        title: "PRDs",
        href: "/prds",
        icon: FileText,
        description: "Product requirement documents.",
      },
      {
        title: "Directives",
        href: "/directives",
        icon: Target,
        description: "Strategic build directives that guide development.",
      },
      {
        title: "AI Employees",
        href: "/ai-employees",
        icon: Bot,
        description: "The autonomous workforce that builds TITAN.",
      },
      {
        title: "Roadmap",
        href: "/roadmap",
        icon: Map,
        description: "What TITAN is building next.",
      },
      {
        title: "Architecture",
        href: "/architecture",
        icon: Boxes,
        description: "System design and structure of the platform.",
      },
    ],
  },
];

/** Secondary navigation, pinned to the bottom of the sidebar. */
export const secondaryNavigation: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Platform configuration and preferences.",
  },
];
