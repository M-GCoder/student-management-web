import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ScheduleEntry {
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
}

function formatTime(time24: string): string {
  if (!time24) return time24;
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function parseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_COLORS: Record<string, string> = {
  Mon: 'bg-blue-100 text-blue-700 border-blue-200',
  Tue: 'bg-purple-100 text-purple-700 border-purple-200',
  Wed: 'bg-green-100 text-green-700 border-green-200',
  Thu: 'bg-orange-100 text-orange-700 border-orange-200',
  Fri: 'bg-red-100 text-red-700 border-red-200',
  Sat: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Sun: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function StudentClassSchedulePage() {
  const [, setLocation] = useLocation();
  const studentIdStr = localStorage.getItem('studentId');
  const studentId = studentIdStr ? parseInt(studentIdStr, 10) : null;

  const { data: enrollments = [] } = trpc.portal.getEnrollments.useQuery(
    { studentId: studentId! },
    { enabled: studentId !== null }
  );

  const activeEnrollment = enrollments.find((e: any) => e.status === 'active') || enrollments[0];
  const classId = activeEnrollment?.classId;

  const { data: classData } = trpc.portal.getClassWithTimings.useQuery(
    { classId: classId! },
    { enabled: classId !== undefined && classId !== null }
  );

  const schedule: ScheduleEntry[] = parseJSON(classData?.classSchedule, []);

  // Group by day
  const groupedByDay = DAY_ORDER.reduce<Record<string, ScheduleEntry[]>>((acc, day) => {
    const entriesForDay = schedule.filter(s => s.day === day);
    if (entriesForDay.length > 0) acc[day] = entriesForDay;
    return acc;
  }, {});

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/student/home', active: false },
    { icon: LayoutGrid, label: 'Dashboard', path: '/student/dashboard', active: true },
    { icon: Wallet, label: 'Payment', path: '/student/payments', active: false },
    { icon: GraduationCap, label: 'Result', path: '/student/results', active: false },
    { icon: Bell, label: 'Announcement', path: '/student/announcements', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/student/dashboard')} className="h-8 w-8 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Class Schedule</h1>
            <p className="text-xs text-muted-foreground">{classData?.className || 'Loading...'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {Object.keys(groupedByDay).length === 0 ? (
          <Card className="p-8 text-center border border-border">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-muted-foreground">No class schedule has been set yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByDay).map(([day, entries]) => (
              <div key={day}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${DAY_COLORS[day] || 'bg-gray-100 text-gray-700'}`}>
                    {day}
                  </span>
                </div>
                <div className="space-y-2">
                  {entries.map((entry, i) => (
                    <Card key={i} className="p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground text-base">{entry.subject}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            🕐 {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${DAY_COLORS[day]?.split(' ').slice(0, 2).join(' ') || 'bg-gray-100'}`}>
                          📖
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${item.active
                  ? 'bg-accent text-white'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className={`w-6 h-6 ${item.active ? 'text-white' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
