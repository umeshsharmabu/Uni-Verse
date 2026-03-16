import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import * as db from "@/lib/localDb";
import { X, Download, Share2, CalendarPlus, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LocalEvent } from "@/lib/localDb";

interface Props {
  eventId: string;
  ticketId: string;
  onClose: () => void;
}

export default function TicketView({ eventId, ticketId, onClose }: Props) {
  const [event, setEvent] = useState<LocalEvent | null>(null);

  useEffect(() => {
    setEvent(db.getEvent(eventId));
  }, [eventId]);

  if (!event) return null;

  const handleAddToCalendar = () => {
    const start = new Date(event.date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${start}&location=${encodeURIComponent(event.venue)}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: event.title,
        text: `I'm attending ${event.title}! Ticket: ${ticketId}`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-card overflow-hidden"
      >
        <div className="relative">
          <img src={event.banner_image || "/placeholder.svg"} alt={event.title} className="h-32 w-full object-cover" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-background/60 p-1.5 backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <h2 className="text-lg font-bold font-heading">{event.title}</h2>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" /> {event.date} • {event.time}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" /> {event.venue}
            </div>
          </div>

          <div className="relative my-5">
            <div className="border-t border-dashed border-border" />
            <div className="absolute -left-8 -top-3 h-6 w-6 rounded-full bg-background" />
            <div className="absolute -right-8 -top-3 h-6 w-6 rounded-full bg-background" />
          </div>

          <div className="flex flex-col items-center">
            <div className="animate-pulse-glow rounded-2xl bg-foreground p-4">
              <QRCodeSVG
                value={`campusdistrict://ticket/${ticketId}`}
                size={160}
                bgColor="#ffffff"
                fgColor="#0F0F12"
                level="H"
              />
            </div>
            <p className="mt-3 font-mono text-sm font-bold tracking-wider text-foreground">
              {ticketId}
            </p>
            <span className="mt-1 rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
              Confirmed ✓
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={handleAddToCalendar} className="rounded-xl border-border text-xs">
              <CalendarPlus className="mr-1 h-3 w-3" /> Calendar
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-xl border-border text-xs">
              <Share2 className="mr-1 h-3 w-3" /> Share
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-border text-xs">
              <Download className="mr-1 h-3 w-3" /> Save
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
