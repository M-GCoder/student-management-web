import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, BookOpen, DollarSign, BarChart3, Home, LogOut, MessageCircle, LogIn, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
}

export default function AnnouncementsPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: "Exam Schedule Released",
      content: "Final exams will be held from April 15-30, 2026. Check your class schedule for details.",
      date: "2026-04-08",
    },
    {
      id: 2,
      title: "Fee Payment Reminder",
      content: "Please ensure all pending fees are paid by April 10, 2026 to avoid late charges.",
      date: "2026-04-05",
    },
  ]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    navigate("/");
  };

  const handleNavigation = (tab: string, path: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  const handleAddAnnouncement = () => {
    if (title.trim() && content.trim()) {
      const newAnnouncement: Announcement = {
        id: announcements.length + 1,
        title,
        content,
        date: new Date().toISOString().split("T")[0],
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setTitle("");
      setContent("");
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogIn className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">Announcements</h2>

        {/* Add Announcement Form */}
        <Card className="p-6 border border-border shadow-sm mb-8 bg-white">
          <h3 className="text-lg font-bold text-foreground mb-4">Create New Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter announcement content"
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Button
              onClick={handleAddAnnouncement}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Announcement
            </Button>
          </div>
        </Card>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card className="p-8 border border-border shadow-sm bg-white text-center">
              <p className="text-muted-foreground">No announcements yet. Create one to get started.</p>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="p-6 border border-border shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{announcement.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{announcement.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-foreground text-sm leading-relaxed">{announcement.content}</p>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("home", "/admin/home")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "home"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Home</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("class", "/admin/classes")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "class"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-medium">Class</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Class</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("payments", "/admin/payments")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "payments"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-xs font-medium">Payments</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Payments</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("results", "/admin/results")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "results"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs font-medium">Results</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Results</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavigation("announcements", "/admin/announcements")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  activeTab === "announcements"
                    ? "text-green-600 bg-green-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Announcements</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Announcements</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
