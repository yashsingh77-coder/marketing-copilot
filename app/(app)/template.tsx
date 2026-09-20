import { PageTransition } from "@/components/motion/page-transition";

// template.tsx re-mounts on every navigation, giving each page an enter animation.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
