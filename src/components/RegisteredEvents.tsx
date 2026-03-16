import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import * as db from "@/lib/localDb";
import { MapPin, Clock, Check } from "lucide-react";
import TicketView from "@/components/TicketView";
import type { LocalEvent } from "@/lib/localDb";

export default function RegisteredEvents() {
  const { registrations } = useApp();
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<{ eventId: string; ticketId: string } | null>(null);

  useEffect(() => {
    if (registrations.length === 0) return;
    const eventIds = registrations.map((r) => r.event_id);
    const allEvents = db.getAllEvents();
    setEvents(allEvents.filter((e) => eventIds.includes(e.id)));
  }, [registrations]);

  if (registrations.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pb-24 text-center">
        <div className="mb-4 text-5xl">🎟️</div>
        <h2 className="text-lg font-semibold font-heading">No Registrations Yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Register for events to see your tickets here
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="mb-4 text-2xl font-bold font-heading">Your Tickets</h1>
      <div className="space-y-3">
        {registrations.map((reg, i) => {
          const event = events.find((e) => e.id === reg.event_id);
          if (!event) return null;
          return (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedTicket({ eventId: reg.event_id, ticketId: reg.ticket_id })}
              className="flex cursor-pointer gap-3 rounded-2xl bg-card p-3 transition-all hover:bg-muted/50 active:scale-[0.98]"
            >
              <img
                src={event.banner_image || "/placeholder.svg"}
                alt={event.title}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  <h3 className="text-sm font-semibold font-heading">{event.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {event.date}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {event.venue}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-medium text-success">
                    <Check className="h-3 w-3" /> {reg.status}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedTicket && (
        <TicketView
          eventId={selectedTicket.eventId}
          ticketId={selectedTicket.ticketId}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
