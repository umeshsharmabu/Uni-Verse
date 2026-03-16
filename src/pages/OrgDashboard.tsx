import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import OrgDashboardHome from "@/components/org/DashboardHome";
import CreateEvent from "@/components/org/CreateEvent";
import MyEvents from "@/components/org/MyEvents";
import OrgBottomNav from "@/components/org/OrgBottomNav";

const tabs = [OrgDashboardHome, CreateEvent, MyEvents];

export default function OrgDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveTab = tabs[activeTab];

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <ActiveTab />
        </motion.div>
      </AnimatePresence>
      <OrgBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
