import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface TestEntry {
  subject: string;
  date: string;
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

function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function parseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

export default function StudentTestSchedulePage() {
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

  const tests: TestEntry[] = parseJSON(classData?.testSchedule, []);

  // Sort tests by date
  const sortedTests = [...tests].sort((a, b) => a.date.localeCompare(b.date));

  // Separate into upcoming and past
  const today = new Date().toISOString().split('T')[0];
  const upcomingTests = sortedTests.filter(t => t.date >= today);
  const pastTests = sortedTests.filter(t => t.date < today);

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/student/home', active: false },
    { icon: LayoutGrid, label: 'Dashboard', path: '/student/dashboard', active: true },
    { icon: Wallet, label: 'Payment', path: '/student/payments', active: false },
    { icon: GraduationCap, label: 'Result', path: '/student/results', active: false },
    { icon: Bell, label: 'Announcement', path: '/student/announcements', active: false },
  ];

  const renderTestCard = (test: TestEntry, index: number, upcoming: boolean) => (
    <Card key={index} className={`p-4 border shadow-sm hover:shadow-md transition-shadow ${upcoming ? 'border-orange-200 bg-orange-50/30' : 'border-border bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground text-base">{test.subject}</p>
          <p className="text-sm text-muted-foreground mt-1">
            📅 {formatDate(test.date)}
          </p>
          <p className="text-sm text-muted-foreground">
            🕐 {formatTime(test.startTime)} – {formatTime(test.endTime)}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${upcoming ? 'bg-orange-100' : 'bg-gray-100'}`}>
          {upcoming ? '📝' : '✅'}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/student/dashboard')} className="h-8 w-8 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Test Schedule</h1>
            <p className="text-xs text-muted-foreground">{classData?.className || 'Loading...'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tests.length === 0 ? (
          <Card className="p-8 text-center border border-border">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-muted-foreground">No test schedule has been set yet.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Upcoming Tests */}
            {upcomingTests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                    Upcoming
                  </span>
                  <span className="text-xs text-muted-foreground">{upcomingTests.length} test(s)</span>
                </div>
                <div className="space-y-2">
                  {upcomingTests.map((test, i) => renderTestCard(test, i, true))}
                </div>
              </div>
            )}

            {/* Past Tests */}
            {pastTests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                    Completed
                  </span>
                  <span className="text-xs text-muted-foreground">{pastTests.length} test(s)</span>
                </div>
                <div className="space-y-2">
                  {pastTests.map((test, i) => renderTestCard(test, i, false))}
                </div>
              </div>
            )}
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
