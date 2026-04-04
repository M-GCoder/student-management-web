import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function StudentManagement() {
  const [showPassword, setShowPassword] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    address: '',
  });

  // Fetch students
  const { data: students = [], refetch } = trpc.students.list.useQuery();

  // Create student mutation
  const createMutation = trpc.students.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Student ${data.firstName} created with ID: ${data.studentId}`);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        dateOfBirth: '',
        address: '',
      });
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create student');
    },
  });

  // Delete student mutation
  const deleteMutation = trpc.students.delete.useMutation({
    onSuccess: () => {
      toast.success('Student deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete student');
    },
  });

  // Update password mutation
  const updatePasswordMutation = trpc.students.updatePassword.useMutation({
    onSuccess: () => {
      toast.success('Password updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update password');
    },
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDeleteStudent = (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Student Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <Input
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <Input
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Email *</label>
                <Input
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Phone</label>
                <Input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Password *</label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Date of Birth</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Address</label>
                <Input
                  type="text"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
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
                  {createMutation.isPending ? 'Creating...' : 'Create Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="table-header text-left">Student ID</th>
              <th className="table-header text-left">Name</th>
              <th className="table-header text-left">Email</th>
              <th className="table-header text-left">Phone</th>
              <th className="table-header text-left">Status</th>
              <th className="table-header text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                <td className="table-cell font-mono text-xs">{student.studentId}</td>
                <td className="table-cell">
                  {student.firstName} {student.lastName}
                </td>
                <td className="table-cell text-xs">{student.email}</td>
                <td className="table-cell text-xs">{student.phone || '-'}</td>
                <td className="table-cell">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'active'
                        ? 'badge-success'
                        : student.status === 'inactive'
                          ? 'badge-pending'
                          : 'badge-danger'
                    }`}
                  >
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setEditingId(student.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Update Password</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const newPassword = (
                              e.currentTarget.elements.namedItem(
                                'newPassword'
                              ) as HTMLInputElement
                            ).value;
                            if (newPassword.length < 6) {
                              toast.error('Password must be at least 6 characters');
                              return;
                            }
                            updatePasswordMutation.mutate({
                              id: student.id,
                              newPassword,
                            });
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="form-label">New Password *</label>
                            <Input
                              name="newPassword"
                              type="password"
                              placeholder="Minimum 6 characters"
                              className="input-field"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={updatePasswordMutation.isPending}
                              className="flex-1 bg-accent hover:bg-accent/90 text-white"
                            >
                              Update
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteStudent(student.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">No students found. Create one to get started.</p>
        </Card>
      )}
    </div>
  );
}
