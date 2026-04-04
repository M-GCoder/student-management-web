import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function PaymentManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
    dueDate: '',
    notes: '',
  });

  // Fetch data
  const { data: students = [] } = trpc.students.list.useQuery();
  const { data: classes = [] } = trpc.classes.list.useQuery();
  const { data: payments = [], refetch } = trpc.payments.byMonth.useQuery({
    month: formData.month,
  });

  // Create payment mutation
  const createMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      toast.success('Payment record created successfully');
      setFormData({
        studentId: '',
        classId: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7),
        dueDate: '',
        notes: '',
      });
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create payment');
    },
  });

  // Update payment status mutation
  const updateStatusMutation = trpc.payments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Payment status updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update payment');
    },
  });

  // Delete payment mutation
  const deleteMutation = trpc.payments.delete.useMutation({
    onSuccess: () => {
      toast.success('Payment deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.classId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      studentId: parseInt(formData.studentId),
      classId: parseInt(formData.classId),
      amount: formData.amount,
      month: formData.month,
      dueDate: formData.dueDate || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleDeletePayment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      deleteMutation.mutate({ id });
    }
  };

  const getStudentName = (id: number) => {
    const student = students.find((s) => s.id === id);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getClassName = (id: number) => {
    const classItem = classes.find((c) => c.id === id);
    return classItem ? classItem.className : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payment Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Viewing payments for: {formData.month}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Payment Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="form-label">Student *</label>
                <select
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Class *</label>
                <select
                  value={formData.classId}
                  onChange={(e) =>
                    setFormData({ ...formData, classId: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Select a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Amount *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Month *</label>
                <Input
                  type="month"
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({ ...formData, month: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Notes</label>
                <Input
                  type="text"
                  placeholder="Additional notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Payment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="table-header text-left">Student</th>
              <th className="table-header text-left">Class</th>
              <th className="table-header text-left">Amount</th>
              <th className="table-header text-left">Month</th>
              <th className="table-header text-left">Status</th>
              <th className="table-header text-left">Due Date</th>
              <th className="table-header text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                <td className="table-cell">{getStudentName(payment.studentId)}</td>
                <td className="table-cell">{getClassName(payment.classId)}</td>
                <td className="table-cell font-semibold">
                  Rs. {parseFloat(payment.amount.toString()).toFixed(2)}
                </td>
                <td className="table-cell">{payment.month}</td>
                <td className="table-cell">
                  <select
                    value={payment.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        id: payment.id,
                        status: e.target.value as 'pending' | 'paid' | 'overdue',
                        paidDate:
                          e.target.value === 'paid'
                            ? new Date().toISOString().split('T')[0]
                            : undefined,
                      })
                    }
                    className={`text-xs px-2 py-1 rounded border ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </td>
                <td className="table-cell text-xs">{payment.dueDate || '-'}</td>
                <td className="table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeletePayment(payment.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length === 0 && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">
            No payments found for {formData.month}. Create one to get started.
          </p>
        </Card>
      )}
    </div>
  );
}
