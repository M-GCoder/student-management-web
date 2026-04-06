import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, LogOut, User } from 'lucide-react';

export default function StudentAnnouncementsPage() {
  const [, setLocation] = useLocation();
  const studentName = localStorage.getItem('studentName') || 'Student';

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    setLocation('/');
  };

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/student/home', active: false },
    { icon: LayoutGrid, label: 'Dashboard', path: '/student/dashboard', active: false },
    { icon: Wallet, label: 'Payment', path: '/student/payments', active: false },
    { icon: GraduationCap, label: 'Result', path: '/student/results', active: false },
    { icon: Bell, label: 'Announcement', path: '/student/announcements', active: true },
  ];

  // Placeholder announcements
  const announcements = [
    {
      id: 1,
      title: 'Class Schedule Update',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      content: 'The class schedule for next month has been updated. Please check your dashboard for the latest timings.',
      type: 'schedule',
    },
    {
      id: 2,
      title: 'Exam Results Published',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      content: 'Your exam results for the April 2026 exam have been published. Please check the Results section.',
      type: 'results',
    },
    {
      id: 3,
      title: 'Fee Payment Reminder',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      content: 'Please pay your pending fee for April 2026 by 08-Apr-2026 to avoid late charges.',
      type: 'payment',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'schedule':
        return 'bg-blue-100 text-blue-700';
      case 'results':
        return 'bg-green-100 text-green-700';
      case 'payment':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule':
        return '📅';
      case 'results':
        return '📊';
      case 'payment':
        return '💳';
      default:
        return '📢';
    }
  };

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
              <p className="text-xs text-muted-foreground">Announcements</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-6">Announcements</h2>

        {announcements.length === 0 ? (
          <Card className="p-12 border border-border shadow-sm text-center">
            <div className="text-5xl mb-4">📢</div>
            <p className="text-muted-foreground">No announcements at the moment</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getTypeIcon(announcement.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-foreground">{announcement.title}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                        {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {announcement.date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{announcement.content}</p>
                  </div>
                </div>
              </Card>
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
