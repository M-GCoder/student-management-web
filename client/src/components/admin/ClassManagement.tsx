import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function ClassManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    instructor: '',
    startDate: '',
    endDate: '',
    capacity: '',
  });

  // Fetch classes
  const { data: classes = [], refetch } = trpc.classes.list.useQuery();

  // Create class mutation
  const createMutation = trpc.classes.create.useMutation({
    onSuccess: () => {
      toast.success('Class created successfully');
      setFormData({
        className: '',
        description: '',
        instructor: '',
        startDate: '',
        endDate: '',
        capacity: '',
      });
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create class');
    },
  });

  // Delete class mutation
  const deleteMutation = trpc.classes.delete.useMutation({
    onSuccess: () => {
      toast.success('Class deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete class');
    },
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className) {
      toast.error('Class name is required');
      return;
    }
    createMutation.mutate({
      className: formData.className,
      description: formData.description || undefined,
      instructor: formData.instructor || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    });
  };

  const handleDeleteClass = (id: number) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Class Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="form-label">Class Name *</label>
                <Input
                  type="text"
                  placeholder="e.g., Web Development 101"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <Input
                  type="text"
                  placeholder="Class description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Instructor</label>
                <Input
                  type="text"
                  placeholder="Instructor name"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Capacity</label>
                <Input
                  type="number"
                  placeholder="Number of students"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
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
                  {createMutation.isPending ? 'Creating...' : 'Create Class'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="table-header text-left">Class Name</th>
              <th className="table-header text-left">Instructor</th>
              <th className="table-header text-left">Start Date</th>
              <th className="table-header text-left">End Date</th>
              <th className="table-header text-left">Capacity</th>
              <th className="table-header text-left">Status</th>
              <th className="table-header text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => (
              <tr key={classItem.id} className="border-b border-border hover:bg-muted/50">
                <td className="table-cell font-semibold">{classItem.className}</td>
                <td className="table-cell">{classItem.instructor || '-'}</td>
                <td className="table-cell text-xs">{classItem.startDate || '-'}</td>
                <td className="table-cell text-xs">{classItem.endDate || '-'}</td>
                <td className="table-cell text-center">{classItem.capacity || '-'}</td>
                <td className="table-cell">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      classItem.status === 'active'
                        ? 'badge-success'
                        : classItem.status === 'inactive'
                          ? 'badge-pending'
                          : 'badge-danger'
                    }`}
                  >
                    {classItem.status.charAt(0).toUpperCase() + classItem.status.slice(1)}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClass(classItem.id)}
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

      {classes.length === 0 && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">No classes found. Create one to get started.</p>
        </Card>
      )}
    </div>
  );
}
