import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, LogOut, User, ChevronRight } from 'lucide-react';

export default function StudentHome() {
  const [, setLocation] = useLocation();
  const studentName = localStorage.getItem('studentName') || 'Student';

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    setLocation('/');
  };

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/student/home', active: true },
    { icon: LayoutGrid, label: 'Dashboard', path: '/student/dashboard', active: false },
    { icon: Wallet, label: 'Payment', path: '/student/payments', active: false },
    { icon: GraduationCap, label: 'Result', path: '/student/results', active: false },
    { icon: Bell, label: 'Announcement', path: '/student/announcements', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      {/* Header with Profile */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">{studentName}</h1>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Feedback
            </Button>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Active Course Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Current Class</h2>

          {/* Active Course Card */}
          <Card className="p-6 border border-border shadow-sm bg-blue-50 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Class 11 A</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="font-semibold text-foreground">A1</span>
                </div>
              </div>
              <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                Enrolled
              </div>
            </div>

            {/* Class Schedule */}
            <div className="space-y-2 mb-6">
              <div className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-foreground">
                Mon 05:10 PM – 7:40 PM
              </div>
              <div className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-foreground">
                Wed 05:10 PM – 8:30 PM
              </div>
              <div className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-foreground">
                Fri 09:00 PM – 11:00 PM
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border border-border bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 text-gray-600">📋</div>
                  <div>
                    <p className="text-xs text-muted-foreground">Roll no:</p>
                    <p className="font-semibold text-foreground">35</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border border-border bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 text-gray-600">📍</div>
                  <div>
                    <p className="text-xs text-muted-foreground">Campus:</p>
                    <p className="font-semibold text-foreground">PIB Colony</p>
                  </div>
                </div>
              </Card>
            </div>
          </Card>

          {/* Fee Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-4">Fee</h3>
            <Card className="p-6 border border-border shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground mb-2">Apr 2026</p>
                  <p className="text-sm text-muted-foreground mb-4">Due: 08-Apr-2026</p>
                  <p className="text-sm text-muted-foreground">Amount:</p>
                </div>
                <div className="text-right">
                  <div className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                    PENDING
                  </div>
                  <p className="text-2xl font-bold text-foreground">Rs: 1000 /-</p>
                </div>
              </div>
            </Card>
          </div>
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
