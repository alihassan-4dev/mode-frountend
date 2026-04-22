import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  contentClassName?: string;
}

const AppLayout = ({ children, contentClassName }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className={contentClassName ?? "p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
