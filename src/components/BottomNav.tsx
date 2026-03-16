import { motion } from "framer-motion";
import { Calendar, Ticket, User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const tabs = [
  { icon: Calendar, label: "Upcoming" },
  { icon: Ticket, label: "Registered" },
  { icon: User, label: "Profile" },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

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
                  layoutId="nav-indicator"
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
      </div>
    </nav>
  );
}
