import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, IndianRupee, Users } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "@/hooks/use-toast";
import type { LocalEvent } from "@/lib/localDb";

interface Props {
  event: LocalEvent;
  onClose: () => void;
}

export default function RegisterDialog({ event, onClose }: Props) {
  const { registerForEvent } = useApp();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const reg = await registerForEvent(event.id);
    setLoading(false);

    if (!reg) {
      toast({ title: "Registration failed", description: "No seats available or an error occurred.", variant: "destructive" });
      return;
    }

    onClose();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FF3B5C", "#FF5F7E", "#FF4D6D", "#ffffff"],
    });

    toast({
      title: "🎉 Registration Confirmed!",
      description: `Ticket ${reg.ticket_id} for ${event.title}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl bg-card p-6 sm:rounded-3xl"
      >
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-12 rounded-full bg-border" />
        </div>

        <img
          src={event.banner_image || "/placeholder.svg"}
          alt={event.title}
          className="mb-4 h-40 w-full rounded-2xl object-cover"
        />

        <h2 className="text-xl font-bold font-heading">{event.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {event.date} • {event.time}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {event.venue}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {event.seats_remaining} seats available
          </div>
          <div className="flex items-center gap-2">
            {Number(event.price) === 0 ? (
              <span className="font-semibold text-success">Free Entry</span>
            ) : (
              <span className="flex items-center font-semibold text-foreground">
                <IndianRupee className="h-4 w-4" /> {String(event.price)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || event.seats_remaining <= 0}
            className="gradient-primary flex-1 rounded-xl text-primary-foreground hover:opacity-90"
          >
            {loading ? "Registering..." : "Confirm Registration"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
