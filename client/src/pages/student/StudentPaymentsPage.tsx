import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, LayoutGrid, Wallet, GraduationCap, Bell, LogOut, User } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function StudentPaymentsPage() {
  const [, setLocation] = useLocation();
  const studentId = parseInt(localStorage.getItem('studentId') || '0');
  const studentName = localStorage.getItem('studentName') || 'Student';

  const { data: payments = [] } = trpc.portal.getPaymentHistory.useQuery(
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
    { icon: Wallet, label: 'Payment', path: '/student/payments', active: true },
    { icon: GraduationCap, label: 'Result', path: '/student/results', active: false },
    { icon: Bell, label: 'Announcement', path: '/student/announcements', active: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
              <p className="text-xs text-muted-foreground">Payments</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-6">Payment History</h2>

        {payments.length === 0 ? (
          <Card className="p-12 border border-border shadow-sm text-center">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-muted-foreground">No payment records found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment: any) => (
              <Card key={payment.id} className="p-6 border border-border shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-foreground">
                        {new Date(payment.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      Rs: {payment.amount} /-
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.toUpperCase()}
                  </div>
                </div>
                {payment.paidDate && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                    Paid on: {new Date(payment.paidDate).toLocaleDateString()}
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
