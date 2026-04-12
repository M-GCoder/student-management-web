import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, LogOut, User, Download, FileBox } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function StudentResultsPage() {
  const [, setLocation] = useLocation();
  const studentId = parseInt(localStorage.getItem('studentId') || '0');
  const studentName = localStorage.getItem('studentName') || 'Student';

  const { data: results = [] } = trpc.portal.getAllResults.useQuery(
    studentId ? { studentId } : { studentId: 0 }
  );

  // Filter only published results
  const publishedResults = results.filter((r: any) => r.publishedDate);

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

        {publishedResults.length === 0 ? (
          <Card className="p-12 border border-border shadow-sm text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-muted-foreground">No exam results available yet</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedResults.map((result: any) => (
              <Card key={result.id} className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{result.examName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Exam Date: {result.examDate}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                     <FileBox className="w-6 h-6 text-accent" />
                  </div>
                </div>

                {/* Remarks */}
                {result.remarks && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Remarks:</p>
                    <p className="text-sm text-foreground">{result.remarks}</p>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                   <p className="text-xs text-muted-foreground">
                     Published: {result.publishedDate}
                   </p>
                   <a 
                     href={result.fileUrl} 
                     download={result.fileName} 
                     className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent/90 rounded-lg text-sm font-medium transition-colors"
                   >
                     <Download className="w-4 h-4" /> Download
                   </a>
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
