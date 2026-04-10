import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Users, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ClassTiming {
  day: string;
  startTime: string;
  endTime: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ClassManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedClassId, setExpandedClassId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    className: '',
    capacity: '',
  });
  const [timings, setTimings] = useState<ClassTiming[]>([
    { day: 'Mon', startTime: '', endTime: '' },
  ]);

  // Fetch classes
  const { data: classes = [], refetch } = trpc.classes.list.useQuery();

  // Fetch all students for enrollment
  const { data: allStudents = [] } = trpc.students.list.useQuery();

  // Fetch enrolled students for expanded class
  const { data: enrolledStudents = [], refetch: refetchEnrolled } = trpc.classes.getStudents.useQuery(
    { classId: expandedClassId! },
    { enabled: expandedClassId !== null }
  );

  // Create class mutation
  const createMutation = trpc.classes.create.useMutation({
    onSuccess: () => {
      toast.success('Class created successfully');
      setFormData({
        className: '',
        capacity: '',
      });
      setTimings([{ day: 'Mon', startTime: '', endTime: '' }]);
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create class');
    },
  });

  // Update class mutation (for updating timings on existing classes)
  const updateMutation = trpc.classes.update.useMutation({
    onSuccess: () => {
      toast.success('Class updated successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update class');
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

  // Bulk enroll mutation
  const bulkEnrollMutation = trpc.classes.bulkEnrollStudents.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.enrolled} student(s) enrolled successfully`);
      setSelectedStudentIds([]);
      refetchEnrolled();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to enroll students');
    },
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className) {
      toast.error('Class name is required');
      return;
    }

    // Filter out empty timings
    const validTimings = timings.filter(t => t.day && t.startTime && t.endTime);

    createMutation.mutate({
      className: formData.className,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      classTimings: validTimings.length > 0 ? JSON.stringify(validTimings) : undefined,
    });
  };

  const handleDeleteClass = (id: number) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEnrollStudents = (classId: number) => {
    if (selectedStudentIds.length === 0) {
      toast.error('Select at least one student');
      return;
    }
    bulkEnrollMutation.mutate({ classId, studentIds: selectedStudentIds });
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleExpand = (classId: number) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      setSelectedStudentIds([]);
    } else {
      setExpandedClassId(classId);
      setSelectedStudentIds([]);
    }
  };

  // Timing helpers
  const addTiming = () => {
    setTimings([...timings, { day: 'Mon', startTime: '', endTime: '' }]);
  };

  const removeTiming = (index: number) => {
    setTimings(timings.filter((_, i) => i !== index));
  };

  const updateTiming = (index: number, field: keyof ClassTiming, value: string) => {
    const updated = [...timings];
    updated[index] = { ...updated[index], [field]: value };
    setTimings(updated);
  };

  const parseTimings = (timingsStr: string | null | undefined): ClassTiming[] => {
    if (!timingsStr) return [];
    try {
      return JSON.parse(timingsStr);
    } catch {
      return [];
    }
  };

  const enrolledStudentIdsSet = new Set(enrolledStudents.map((e: any) => e.studentId));

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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="form-label">Class Name *</label>
                <Input
                  type="text"
                  placeholder="e.g., Class 11 A"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                  className="input-field"
                />
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

              {/* Class Timings Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label flex items-center gap-2 mb-0">
                    <Clock className="w-4 h-4" />
                    Class Timings
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTiming}
                    className="h-7 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Timing
                  </Button>
                </div>
                <div className="space-y-2">
                  {timings.map((timing, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <select
                        value={timing.day}
                        onChange={(e) => updateTiming(index, 'day', e.target.value)}
                        className="input-field text-sm py-1 px-2 w-20"
                      >
                        {DAYS.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <Input
                        type="time"
                        value={timing.startTime}
                        onChange={(e) => updateTiming(index, 'startTime', e.target.value)}
                        className="input-field text-sm py-1 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={timing.endTime}
                        onChange={(e) => updateTiming(index, 'endTime', e.target.value)}
                        className="input-field text-sm py-1 flex-1"
                      />
                      {timings.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTiming(index)}
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
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
              <th className="table-header text-left"></th>
              <th className="table-header text-left">Class Name</th>
              <th className="table-header text-left">Timings</th>
              <th className="table-header text-left">Capacity</th>
              <th className="table-header text-left">Status</th>
              <th className="table-header text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem) => {
              const classTimings = parseTimings((classItem as any).classTimings);
              const isExpanded = expandedClassId === classItem.id;

              return (
                <>
                  <tr key={classItem.id} className="border-b border-border hover:bg-muted/50">
                    <td className="table-cell w-8">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toggleExpand(classItem.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                    <td className="table-cell font-semibold">{classItem.className}</td>
                    <td className="table-cell">
                      {classTimings.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {classTimings.map((t, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                            >
                              {t.day} {t.startTime}–{t.endTime}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No timings set</span>
                      )}
                    </td>
                    <td className="table-cell text-center">{classItem.capacity || '-'}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classItem.status === 'active'
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

                  {/* Expanded Row: Student Enrollment */}
                  {isExpanded && (
                    <tr key={`${classItem.id}-expanded`}>
                      <td colSpan={7} className="p-0">
                        <div className="bg-muted/30 border-b border-border p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-accent" />
                            <h4 className="font-semibold text-sm text-foreground">
                              Manage Students — {classItem.className}
                            </h4>
                          </div>

                          {/* Currently Enrolled */}
                          {enrolledStudents.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Currently Enrolled ({enrolledStudents.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {enrolledStudents.map((enrollment: any) => {
                                  const student = allStudents.find((s: any) => s.id === enrollment.studentId);
                                  return (
                                    <span
                                      key={enrollment.id}
                                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                                    >
                                      {student
                                        ? `${student.firstName} ${student.lastName}`
                                        : `Student #${enrollment.studentId}`}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Select Students to Enroll */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Select Students to Add
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto mb-3">
                              {allStudents
                                .filter((s: any) => !enrolledStudentIdsSet.has(s.id))
                                .map((student: any) => (
                                  <label
                                    key={student.id}
                                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-xs ${selectedStudentIds.includes(student.id)
                                      ? 'border-accent bg-accent/10'
                                      : 'border-border bg-white hover:bg-muted/50'
                                      }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedStudentIds.includes(student.id)}
                                      onChange={() => toggleStudentSelection(student.id)}
                                      className="accent-accent"
                                    />
                                    <span className="truncate">
                                      {student.firstName} {student.lastName}
                                    </span>
                                  </label>
                                ))}
                              {allStudents.filter((s: any) => !enrolledStudentIdsSet.has(s.id)).length === 0 && (
                                <p className="text-xs text-muted-foreground col-span-full py-2">
                                  All students are already enrolled in this class.
                                </p>
                              )}
                            </div>
                            {selectedStudentIds.length > 0 && (
                              <Button
                                size="sm"
                                className="bg-accent hover:bg-accent/90 text-white"
                                onClick={() => handleEnrollStudents(classItem.id)}
                                disabled={bulkEnrollMutation.isPending}
                              >
                                {bulkEnrollMutation.isPending
                                  ? 'Enrolling...'
                                  : `Enroll ${selectedStudentIds.length} Student(s)`}
                              </Button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
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
