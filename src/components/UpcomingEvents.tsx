import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bookmark, BookmarkCheck, MapPin, Clock, IndianRupee, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/mockEvents";
import { useApp } from "@/contexts/AppContext";
import RegisterDialog from "@/components/RegisterDialog";
import * as db from "@/lib/localDb";
import type { LocalEvent } from "@/lib/localDb";

export default function UpcomingEvents() {
  const { profile, toggleBookmark, isBookmarked, isRegistered } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<LocalEvent | null>(null);
  const [events, setEvents] = useState<LocalEvent[]>([]);

  useEffect(() => {
    setEvents(db.getAllEvents());
  }, []);

  // Refresh events after registration
  const refreshEvents = () => setEvents(db.getAllEvents());

  const filtered = useMemo(() => {
    let list = events;
    if (activeCategory !== "All") {
      list = list.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeCategory, events]);

  const trending = events.filter((e) => e.trending);

  const preferences = profile?.preferences || [];
  const recommended = preferences.length > 0
    ? filtered.filter((e) => preferences.includes(e.category))
    : [];
  const rest = preferences.length > 0
    ? filtered.filter((e) => !preferences.includes(e.category))
    : filtered;

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold font-heading">
          Hi, {profile?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">What's happening on campus?</p>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl bg-secondary pl-10 border-border placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              activeCategory === cat
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeCategory === "All" && !search && trending.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 px-4 text-lg font-semibold font-heading">🔥 Trending</h2>
          <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
            {trending.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative shrink-0 w-64 overflow-hidden rounded-2xl bg-card cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <img
                  src={event.banner_image || "/placeholder.svg"}
                  alt={event.title}
                  className="h-36 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <h3 className="text-sm font-semibold font-heading truncate">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{event.date} • {event.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {activeCategory === "All" && !search && recommended.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 px-4 text-lg font-semibold font-heading">✨ Recommended For You</h2>
          <div className="space-y-4 px-4">
            {recommended.slice(0, 3).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isBookmarked={isBookmarked(event.id)}
                isRegistered={isRegistered(event.id)}
                onBookmark={() => toggleBookmark(event.id)}
                onRegister={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="px-4">
        <h2 className="mb-3 text-lg font-semibold font-heading">
          {activeCategory === "All" && !search ? "Happening This Week" : `${activeCategory} Events`}
        </h2>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {rest.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
                isBookmarked={isBookmarked(event.id)}
                isRegistered={isRegistered(event.id)}
                onBookmark={() => toggleBookmark(event.id)}
                onRegister={() => setSelectedEvent(event)}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No events found
            </div>
          )}
        </div>
      </section>

      {selectedEvent && !isRegistered(selectedEvent.id) && (
        <RegisterDialog event={selectedEvent} onClose={() => { setSelectedEvent(null); refreshEvents(); }} />
      )}
    </div>
  );
}

function EventCard({ event, index = 0, isBookmarked, isRegistered, onBookmark, onRegister }: {
  event: LocalEvent;
  index?: number;
  isBookmarked: boolean;
  isRegistered: boolean;
  onBookmark: () => void;
  onRegister: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="overflow-hidden rounded-2xl bg-card"
    >
      <div className="relative">
        <img
          src={event.banner_image || "/placeholder.svg"}
          alt={event.title}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          className="absolute right-3 top-3 rounded-full bg-background/60 p-2 backdrop-blur-sm transition-colors hover:bg-background/80"
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-foreground" />
          )}
        </button>
        <div className="absolute left-3 top-3 rounded-full bg-background/60 px-3 py-1 backdrop-blur-sm">
          <span className="text-xs font-medium text-foreground">{event.category}</span>
        </div>
        {event.seats_remaining <= 0 && (
          <div className="absolute right-3 bottom-3 rounded-full bg-destructive px-3 py-1">
            <span className="text-xs font-bold text-destructive-foreground">Sold Out</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold font-heading">{event.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {event.date} • {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {event.venue}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {event.seats_remaining} left
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center text-sm font-semibold text-foreground">
            {Number(event.price) === 0 ? (
              <span className="text-success">Free</span>
            ) : (
              <span className="flex items-center"><IndianRupee className="h-3 w-3" />{String(event.price)}</span>
            )}
          </span>
          {isRegistered ? (
            <span className="rounded-full bg-success/20 px-4 py-2 text-xs font-medium text-success">
              Registered ✓
            </span>
          ) : event.seats_remaining <= 0 ? (
            <span className="rounded-full bg-destructive/20 px-4 py-2 text-xs font-medium text-destructive">
              Sold Out
            </span>
          ) : (
            <Button
              onClick={onRegister}
              className="gradient-primary rounded-full px-6 text-xs font-semibold text-primary-foreground hover:opacity-90"
              size="sm"
            >
              Register
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
