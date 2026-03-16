import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { pastEvents } from "@/data/mockUser";
import { LogOut, Edit, Star, Trophy, Flame, Layers, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { profile, logout } = useApp();
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    pastEvents.forEach((e) => {
      if (e.rating) map[e.id] = e.rating;
    });
    return map;
  });

  if (!profile) return null;

  const achievements = [
    { id: "ach-1", badgeName: "First Event", icon: "🎉" },
    { id: "ach-2", badgeName: "5 Events", icon: "⭐" },
    { id: "ach-3", badgeName: "Tech Explorer", icon: "💻" },
    { id: "ach-4", badgeName: "Social Butterfly", icon: "🦋" },
  ];

  return (
    <div className="px-4 pb-24 pt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 rounded-2xl bg-card p-5"
      >
        <button className="absolute right-4 top-4 rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground">
          <Edit className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary ring-2 ring-primary/30">
            {profile.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading">{profile.name || "User"}</h2>
            <p className="text-xs text-muted-foreground">{profile.department || "No department"}</p>
            <p className="text-xs text-muted-foreground">
              {profile.year || ""} {profile.year && profile.college ? "•" : ""} {profile.college || ""}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { icon: Calendar, label: "Attended", value: 0 },
          { icon: Layers, label: "Categories", value: 0 },
          { icon: Flame, label: "Streak", value: "0 🔥" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center rounded-2xl bg-card p-4"
          >
            <stat.icon className="mb-1 h-4 w-4 text-primary" />
            <span className="text-lg font-bold font-heading">{stat.value}</span>
            <span className="text-[10px] text-muted-foreground">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <section className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold font-heading">
          <Trophy className="h-4 w-4 text-warning" /> Achievements
        </h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {achievements.map((ach) => (
            <div key={ach.id} className="flex shrink-0 flex-col items-center gap-1 rounded-2xl bg-card px-4 py-3">
              <span className="text-2xl">{ach.icon}</span>
              <span className="text-[10px] font-medium text-foreground">{ach.badgeName}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-base font-semibold font-heading">Past Events</h3>
        <div className="relative space-y-0">
          {pastEvents.map((event, i) => (
            <div key={event.id} className="relative flex gap-3 pb-4">
              {i < pastEvents.length - 1 && (
                <div className="absolute left-[7px] top-6 h-full w-0.5 bg-border" />
              )}
              <div className="relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 border-primary bg-background" />
              <div className="flex-1 rounded-xl bg-card p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <span className="mt-1 inline-block rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-medium text-success">
                      Attended
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRatings((prev) => ({ ...prev, [event.id]: star }))}>
                        <Star className={`h-3.5 w-3.5 ${star <= (ratings[event.id] || 0) ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Button
        variant="outline"
        onClick={logout}
        className="w-full rounded-xl border-border text-destructive hover:bg-destructive/10"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>

      <p className="mt-4 text-center text-[10px] text-muted-foreground">Campus District v2.0.0</p>
    </div>
  );
}
