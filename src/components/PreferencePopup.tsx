import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import * as db from "@/lib/localDb";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";

const preferenceOptions = ["Tech", "Cultural", "Sports", "Workshops", "Fests", "Hackathons"];

export default function PreferencePopup() {
  const { userId, refreshProfile } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (pref: string) => {
    setSelected((prev) => {
      if (prev.includes(pref)) return prev.filter((p) => p !== pref);
      if (prev.length >= 2) return prev;
      return [...prev, pref];
    });
  };

  const handleSave = async () => {
    if (selected.length === 0 || !userId) return;
    setSaving(true);
    try {
      await db.updateProfile(userId, { preferences: selected });
      await refreshProfile();
      toast({ title: "Preferences saved! 🎉" });
    } catch (error) {
      toast({
        title: "Could not save preferences",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="glass w-full max-w-sm rounded-3xl p-6"
      >
        <h2 className="text-xl font-bold font-heading text-center mb-1">
          Tell us what you're interested in
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Select up to 2 preferences
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {preferenceOptions.map((pref) => {
            const isActive = selected.includes(pref);
            return (
              <motion.button
                key={pref}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(pref)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "gradient-primary text-primary-foreground glow-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {pref}
              </motion.button>
            );
          })}
        </div>

        <Button
          onClick={handleSave}
          disabled={selected.length === 0 || saving}
          className="gradient-primary w-full rounded-xl h-12 text-base font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
