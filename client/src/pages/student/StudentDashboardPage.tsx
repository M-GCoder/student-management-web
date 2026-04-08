import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, LogOut, User, ChevronRight, BarChart3 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function StudentDashboardPage() {
  const [, setLocation] = useLocation();
  const studentId = parseInt(localStorage.getItem('studentId') || '0');
  const studentName = localStorage.getItem('studentName') || 'Student';

  const { data: latestResult } = trpc.portal.getLatestResult.useQuery(
    studentId ? { studentId } : { studentId: 0 }
  );

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    setLocation('/');
  };

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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">{studentName}</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Latest Result Card */}
          <Card className="p-6 border border-border shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                Latest
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Last Exam Score</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {latestResult?.score ?? 'N/A'}
            </h3>
            {latestResult && (
              <p className="text-xs text-muted-foreground">
                Exam: {latestResult.examName}
              </p>
            )}
          </Card>

          {/* Attendance Card */}
          <Card className="p-6 border border-border shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Current
              </span>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Attendance</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">85%</h3>
            <p className="text-xs text-muted-foreground">Classes attended</p>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card className="p-6 border border-border shadow-sm mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Mathematics</span>
                <span className="text-sm font-semibold text-accent">85/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">English</span>
                <span className="text-sm font-semibold text-accent">78/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Science</span>
                <span className="text-sm font-semibold text-accent">92/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border border-border shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm font-medium text-foreground">View Assignments</p>
            </div>
          </Card>
          <Card className="p-4 border border-border shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm font-medium text-foreground">Test Schedule</p>
            </div>
          </Card>
        </div>
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
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                  item.active
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
