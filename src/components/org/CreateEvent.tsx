import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as db from "@/lib/localDb";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { categories } from "@/data/mockEvents";

const eventCategories = categories.filter((c) => c !== "All");

export default function CreateEvent() {
  const { userId } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Tech",
    date: "",
    time: "",
    venue: "",
    price: "0",
    total_seats: "100",
    banner_image: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.title || !form.date || !form.time || !form.venue) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setLoading(true);

    db.createEvent({
      title: form.title.trim().slice(0, 200),
      description: form.description.trim().slice(0, 1000),
      category: form.category,
      date: form.date,
      time: form.time,
      venue: form.venue.trim().slice(0, 200),
      price: parseFloat(form.price) || 0,
      total_seats: parseInt(form.total_seats) || 100,
      seats_remaining: parseInt(form.total_seats) || 100,
      banner_image: form.banner_image.trim() || null,
      created_by: userId!,
      trending: false,
    });

    setLoading(false);
    toast({ title: "Event created! 🎉" });
    setForm({ title: "", description: "", category: "Tech", date: "", time: "", venue: "", price: "0", total_seats: "100", banner_image: "" });
  };

  return (
    <div className="px-4 pb-24 pt-6">
      <h1 className="text-2xl font-bold font-heading mb-6">Create Event</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 space-y-4"
      >
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Event Title *</label>
          <Input placeholder="Enter event title" value={form.title} onChange={(e) => update("title", e.target.value)} className="h-11 rounded-xl bg-secondary border-border" maxLength={200} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Description</label>
          <Textarea placeholder="Describe your event..." value={form.description} onChange={(e) => update("description", e.target.value)} className="rounded-xl bg-secondary border-border min-h-[80px]" maxLength={1000} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {eventCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => update("category", cat)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  form.category === cat ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Date *</label>
            <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} className="h-11 rounded-xl bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Time *</label>
            <Input placeholder="10:00 AM" value={form.time} onChange={(e) => update("time", e.target.value)} className="h-11 rounded-xl bg-secondary border-border" maxLength={20} />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Venue *</label>
          <Input placeholder="Event location" value={form.venue} onChange={(e) => update("venue", e.target.value)} className="h-11 rounded-xl bg-secondary border-border" maxLength={200} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Price (₹)</label>
            <Input type="number" min="0" value={form.price} onChange={(e) => update("price", e.target.value)} className="h-11 rounded-xl bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Total Seats</label>
            <Input type="number" min="1" value={form.total_seats} onChange={(e) => update("total_seats", e.target.value)} className="h-11 rounded-xl bg-secondary border-border" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Banner Image URL</label>
          <Input placeholder="https://images.unsplash.com/..." value={form.banner_image} onChange={(e) => update("banner_image", e.target.value)} className="h-11 rounded-xl bg-secondary border-border" />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="gradient-primary w-full rounded-xl h-12 text-base font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {loading ? "Creating..." : "Create Event"}
        </Button>
      </motion.div>
    </div>
  );
}
