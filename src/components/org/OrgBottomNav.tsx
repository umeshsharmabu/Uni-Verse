import { motion } from "framer-motion";
import { LayoutDashboard, PlusCircle, List, LogOut } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const tabs = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: PlusCircle, label: "Create" },
  { icon: List, label: "My Events" },
];

interface Props {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

export default function OrgBottomNav({ activeTab, setActiveTab }: Props) {
  const { logout } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg px-4 pb-4">
      <div className="glass flex items-center justify-around rounded-2xl px-2 py-2">
        {tabs.map((tab, i) => {
          const active = activeTab === i;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className="relative flex flex-1 flex-col items-center gap-1 py-2 transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="org-nav-indicator"
                  className="absolute -top-1 h-1 w-8 rounded-full gradient-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={logout}
          className="relative flex flex-1 flex-col items-center gap-1 py-2 transition-colors"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground">Logout</span>
        </button>
      </div>
    </nav>
  );
}
