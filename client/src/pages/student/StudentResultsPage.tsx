import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, LogOut, User } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function StudentResultsPage() {
  const [, setLocation] = useLocation();
  const studentId = parseInt(localStorage.getItem('studentId') || '0');
  const studentName = localStorage.getItem('studentName') || 'Student';

  const { data: results = [] } = trpc.portal.getAllResults.useQuery(
    studentId ? { studentId } : { studentId: 0 }
  );

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    setLocation('/');
  };

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/student/home', active: false },
    { icon: LayoutGrid, label: 'Dashboard', path: '/student/dashboard', active: false },
    { icon: Wallet, label: 'Payment', path: '/student/payments', active: false },
    { icon: GraduationCap, label: 'Result', path: '/student/results', active: true },
    { icon: Bell, label: 'Announcement', path: '/student/announcements', active: false },
  ];

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-600';
    switch (grade.toUpperCase()) {
      case 'A':
      case 'A+':
        return 'text-green-600';
      case 'B':
      case 'B+':
        return 'text-blue-600';
      case 'C':
      case 'C+':
        return 'text-yellow-600';
      case 'D':
        return 'text-orange-600';
      case 'F':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
              <p className="text-xs text-muted-foreground">Results</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-6">Exam Results</h2>

        {results.length === 0 ? (
          <Card className="p-12 border border-border shadow-sm text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-muted-foreground">No exam results available yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result: any) => (
              <Card key={result.id} className="p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{result.examName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Exam Date: {new Date(result.examDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getGradeColor(result.grade)}`}>
                      {result.grade || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Grade</p>
                  </div>
                </div>

                {/* Score Details */}
                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{result.score}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{result.totalMarks}</p>
                    <p className="text-xs text-muted-foreground">Total Marks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{result.percentage || 'N/A'}%</p>
                    <p className="text-xs text-muted-foreground">Percentage</p>
                  </div>
                </div>

                {/* Remarks */}
                {result.remarks && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Remarks:</p>
                    <p className="text-sm text-foreground">{result.remarks}</p>
                  </div>
                )}

                {/* Published Date */}
                {result.publishedDate && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                    Published on: {new Date(result.publishedDate).toLocaleDateString()}
                  </p>
                )}
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
