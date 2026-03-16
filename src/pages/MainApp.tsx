import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";
import UpcomingEvents from "@/components/UpcomingEvents";
import RegisteredEvents from "@/components/RegisteredEvents";
import Profile from "@/components/Profile";

const tabs = [UpcomingEvents, RegisteredEvents, Profile];

export default function MainApp() {
  const { activeTab } = useApp();
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
      <BottomNav />
    </div>
  );
}
