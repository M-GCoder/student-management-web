import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, LogOut, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { skipToken } from '@tanstack/react-query';

interface StudentInfo {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [currentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Fetch current month fee status
  const { data: currentFee } = trpc.portal.getCurrentMonthFee.useQuery(
    student ? { studentId: student.id, month: currentMonth } : skipToken
  );

  // Fetch latest exam result
  const { data: latestResult } = trpc.portal.getLatestResult.useQuery(
    student ? { studentId: student.id } : skipToken
  );

  // Fetch payment history
  const { data: paymentHistory } = trpc.portal.getPaymentHistory.useQuery(
    student ? { studentId: student.id } : skipToken
  );

  useEffect(() => {
    // Get student info from localStorage
    const studentId = localStorage.getItem('studentId');
    const studentName = localStorage.getItem('studentName');

    if (!studentId || !studentName) {
      setLocation('/');
      return;
    }

    setStudent({
      id: parseInt(studentId),
      studentId: '',
      firstName: studentName.split(' ')[0],
      lastName: studentName.split(' ')[1] || '',
      email: '',
    });
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    setLocation('/');
  };

  if (!student) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const feeStatus = currentFee?.status || 'not_found';
  const feeAmount = currentFee?.amount ? parseFloat(currentFee.amount.toString()) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SSCC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Student Portal</h1>
              <p className="text-xs text-muted-foreground">Welcome, {student.firstName}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {student.firstName}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your Academic & Fee status.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Month Fee Card */}
          <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Current Month Fee</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {feeAmount > 0 ? `Rs. ${feeAmount.toFixed(2)}` : 'No fee'}
                </h3>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  feeStatus === 'paid'
                    ? 'bg-green-500'
                    : feeStatus === 'pending'
                      ? 'bg-yellow-500'
                      : 'bg-gray-300'
                }`}
              />
              <span className="text-xs font-medium text-muted-foreground">
                Status:{' '}
                <span className="text-foreground capitalize">
                  {feeStatus === 'not_found' ? 'No record' : feeStatus}
                </span>
              </span>
            </div>
            {currentFee?.dueDate && (
              <p className="text-xs text-muted-foreground mt-2">
                Due: {currentFee.dueDate}
              </p>
            )}
          </Card>

          {/* Latest Exam Score Card */}
          <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Last Exam</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {latestResult
                    ? latestResult.examName
                    : 'No results'}
                </h3>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
            {latestResult && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-foreground">
                    {latestResult.examDate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  File: <span className="font-semibold text-foreground">{latestResult.fileName}</span>
                </p>
              </>
            )}
          </Card>

          {/* Payment Status Card */}
          <Card className="p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Payment History</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {paymentHistory?.length || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Total records: {paymentHistory?.length || 0}
            </p>
          </Card>
        </div>

        {/* Payment History Table */}
        {paymentHistory && paymentHistory.length > 0 && (
          <Card className="p-6 border border-border shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="table-header text-left">Month</th>
                    <th className="table-header text-left">Amount</th>
                    <th className="table-header text-left">Status</th>
                    <th className="table-header text-left">Due Date</th>
                    <th className="table-header text-left">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                      <td className="table-cell">{payment.month}</td>
                      <td className="table-cell font-semibold">
                        Rs. {parseFloat(payment.amount.toString()).toFixed(2)}
                      </td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'paid'
                              ? 'badge-success'
                              : payment.status === 'pending'
                                ? 'badge-pending'
                                : 'badge-danger'
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">{payment.dueDate || '-'}</td>
                      <td className="table-cell">{payment.paidDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Exam Results Table */}
        {latestResult && (
          <Card className="p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Latest Exam Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Exam Name</p>
                <p className="text-lg font-semibold text-foreground">{latestResult.examName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exam Date</p>
                <p className="text-lg font-semibold text-foreground">{latestResult.examDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exam</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestResult.examName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestResult.examDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">File</p>
                <p className="text-lg font-semibold text-foreground">{latestResult.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-lg font-semibold text-foreground">
                  {latestResult.publishedDate || 'Not yet published'}
                </p>
              </div>
            </div>
            {latestResult.remarks && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">Remarks</p>
                <p className="text-foreground">{latestResult.remarks}</p>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
