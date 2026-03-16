import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Armchair, TrendingUp } from "lucide-react";
import * as db from "@/lib/localDb";
import { useApp } from "@/contexts/AppContext";

interface Stats {
  totalEvents: number;
  totalRegistrations: number;
  seatsFilled: number;
  upcomingCount: number;
}

export default function DashboardHome() {
  const { userId, profile } = useApp();
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, totalRegistrations: 0, seatsFilled: 0, upcomingCount: 0 });

  useEffect(() => {
    if (!userId) return;
    const events = db.getEventsByCreator(userId);
    if (events.length === 0) {
      setStats({ totalEvents: 0, totalRegistrations: 0, seatsFilled: 0, upcomingCount: 0 });
      return;
    }

    let totalRegs = 0;
    for (const evt of events) {
      totalRegs += db.getRegistrationCountByEvent(evt.id);
    }

    const seatsFilled = events.reduce((sum, e) => sum + (e.total_seats - e.seats_remaining), 0);
    const today = new Date().toISOString().split("T")[0];
    const upcomingCount = events.filter((e) => e.date >= today).length;

    setStats({ totalEvents: events.length, totalRegistrations: totalRegs, seatsFilled, upcomingCount });
  }, [userId]);

  const cards = [
    { icon: Calendar, label: "Total Events", value: stats.totalEvents, color: "text-primary" },
    { icon: Users, label: "Registrations", value: stats.totalRegistrations, color: "text-success" },
    { icon: Armchair, label: "Seats Filled", value: stats.seatsFilled, color: "text-warning" },
    { icon: TrendingUp, label: "Upcoming", value: stats.upcomingCount, color: "text-accent" },
  ];

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold font-heading mb-1">
        Welcome, {profile?.name || "Organiser"} 👋
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Your organisation dashboard</p>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl bg-card p-5"
          >
            <card.icon className={`h-6 w-6 mb-2 ${card.color}`} />
            <p className="text-2xl font-bold font-heading">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
