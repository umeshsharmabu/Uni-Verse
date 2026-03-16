export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  year: string;
  profileImage: string;
  eventsAttended: number;
  categoriesExplored: number;
  streak: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  badgeName: string;
  icon: string;
  earnedAt: string;
}

export const mockUser: User = {
  id: "usr-001",
  name: "Arjun Mehta",
  email: "arjun.mehta@college.edu",
  college: "National Institute of Technology",
  department: "Computer Science & Engineering",
  year: "3rd Year",
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  eventsAttended: 12,
  categoriesExplored: 4,
  streak: 5,
  achievements: [
    { id: "ach-1", badgeName: "First Event", icon: "🎉", earnedAt: "2025-09-15" },
    { id: "ach-2", badgeName: "5 Events", icon: "⭐", earnedAt: "2025-11-20" },
    { id: "ach-3", badgeName: "Tech Explorer", icon: "💻", earnedAt: "2025-12-01" },
    { id: "ach-4", badgeName: "Social Butterfly", icon: "🦋", earnedAt: "2026-01-10" },
  ],
};

export interface PastEvent {
  id: string;
  title: string;
  date: string;
  category: string;
  rating: number | null;
}

export const pastEvents: PastEvent[] = [
  { id: "past-1", title: "AI Workshop 2025", date: "2025-12-15", category: "Tech", rating: 5 },
  { id: "past-2", title: "Cultural Nite", date: "2025-11-28", category: "Cultural", rating: 4 },
  { id: "past-3", title: "Football Tournament", date: "2025-11-10", category: "Sports", rating: null },
  { id: "past-4", title: "Web Dev Bootcamp", date: "2025-10-20", category: "Workshops", rating: 5 },
  { id: "past-5", title: "Freshers' Fest", date: "2025-09-15", category: "Fests", rating: 4 },
];
