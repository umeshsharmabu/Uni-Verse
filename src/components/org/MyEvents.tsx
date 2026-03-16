import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as db from "@/lib/localDb";
import { useApp } from "@/contexts/AppContext";
import { Users, QrCode, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import TicketScanner from "@/components/TicketScanner";
import type { LocalEvent } from "@/lib/localDb";

interface EventWithCount extends LocalEvent {
  registrationCount: number;
}

export default function MyEvents() {
  const { userId } = useApp();
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [scanningEvent, setScanningEvent] = useState<LocalEvent | null>(null);

  useEffect(() => {
    if (!userId) return;
    const evts = db.getEventsByCreator(userId);
    const withCounts: EventWithCount[] = evts.map((evt) => ({
      ...evt,
      registrationCount: db.getRegistrationCountByEvent(evt.id),
    }));
    setEvents(withCounts);
  }, [userId]);

  if (scanningEvent) {
    return <TicketScanner event={scanningEvent} onClose={() => setScanningEvent(null)} />;
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold font-heading mb-4">My Events</h1>

      {events.length === 0 && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl">📅</div>
          <h2 className="text-lg font-semibold font-heading">No Events Yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create your first event to get started</p>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-card overflow-hidden"
          >
            {event.banner_image && (
              <img src={event.banner_image} alt={event.title} className="h-32 w-full object-cover" loading="lazy" />
            )}
            <div className="p-4">
              <h3 className="text-base font-semibold font-heading">{event.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{event.date} • {event.time}</p>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-primary" />
                  {event.registrationCount} registrations
                </span>
                <span>
                  {event.seats_remaining}/{event.total_seats} seats left
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-border text-xs">
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => setScanningEvent(event)}
                  className="gradient-primary flex-1 rounded-xl text-xs text-primary-foreground hover:opacity-90"
                >
                  <QrCode className="mr-1 h-3 w-3" /> Scan Tickets
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
