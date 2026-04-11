import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { Home, LayoutGrid, DollarSign, BookOpen, Bell, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { skipToken } from "@tanstack/react-query";

export default function StudentAnnouncementsPage() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const [studentAnnouncements, setStudentAnnouncements] = useState<any[]>([]);

  // Fetch student's class
  const { data: enrollments = [] } = trpc.portal.getEnrollments.useQuery(
    user?.id ? { studentId: user.id } : skipToken,
    { enabled: !!user?.id }
  );

  // Fetch all announcements
  const { data: allAnnouncements = [] } = trpc.announcements.list.useQuery();

  // Filter announcements for student's classes and remove expired ones
  useEffect(() => {
    if (enrollments.length > 0 && allAnnouncements.length > 0) {
      const classIds = enrollments.map((e: any) => e.classId);
      const now = new Date();
      
      const filtered = allAnnouncements.filter((ann: any) => {
        const isForStudentClass = classIds.includes(ann.classId);
        const isNotExpired = new Date(ann.expiresAt) > now;
        return isForStudentClass && isNotExpired;
      });

      setStudentAnnouncements(filtered.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  }, [enrollments, allAnnouncements]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{user?.name || "Student"}</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">Announcements</h2>

        {studentAnnouncements.length === 0 ? (
          <Card className="p-8 text-center border border-border shadow-sm">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No announcements for your classes at this time.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {studentAnnouncements.map((announcement: any) => (
              <Card
                key={announcement.id}
                className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {announcement.title}
                  </h3>
                  <div className="text-sm text-muted-foreground mb-3">
                    Posted on {new Date(announcement.createdAt).toLocaleDateString()} at{" "}
                    {new Date(announcement.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <p className="text-foreground mb-4 leading-relaxed">
                  {announcement.description}
                </p>

                {(announcement.imageUrl || announcement.documentUrl) && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                    {announcement.imageUrl && (
                      <a
                        href={announcement.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        📷 View Image
                      </a>
                    )}
                    {announcement.documentUrl && (
                      <a
                        href={announcement.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        📄 View Document
                      </a>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Expires: {new Date(announcement.expiresAt).toLocaleDateString()} at{" "}
                  {new Date(announcement.expiresAt).toLocaleTimeString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/student/home")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
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
                onClick={() => navigate("/student/dashboard")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-xs font-medium">Dashboard</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Dashboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/student/payments")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
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
                onClick={() => navigate("/student/results")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-medium">Results</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Results</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/student/announcements")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-green-600 bg-green-50"
              >
                <Bell className="w-6 h-6" />
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
