import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, Send } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function ResultsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
    examName: '',
    score: '',
    totalMarks: '',
    percentage: '',
    grade: '',
    examDate: '',
    remarks: '',
  });

  // Fetch data
  const { data: students = [] } = trpc.students.list.useQuery();
  const { data: classes = [] } = trpc.classes.list.useQuery();
  const { data: results = [], refetch } = trpc.results.byClass.useQuery(
    selectedClassId ? { classId: selectedClassId } : { classId: 0 },
    { enabled: !!selectedClassId }
  );

  // Create result mutation
  const createMutation = trpc.results.create.useMutation({
    onSuccess: () => {
      toast.success('Exam result created successfully');
      setFormData({
        studentId: '',
        classId: '',
        examName: '',
        score: '',
        totalMarks: '',
        percentage: '',
        grade: '',
        examDate: '',
        remarks: '',
      });
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create result');
    },
  });

  // Publish results mutation
  const publishMutation = trpc.results.publishForClass.useMutation({
    onSuccess: (data) => {
      toast.success(`Published results for ${data.published} students`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to publish results');
    },
  });

  // Delete result mutation
  const deleteMutation = trpc.results.delete.useMutation({
    onSuccess: () => {
      toast.success('Result deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete result');
    },
  });

  const handleCreateResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.studentId ||
      !formData.classId ||
      !formData.examName ||
      !formData.score ||
      !formData.totalMarks ||
      !formData.examDate
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Calculate percentage if not provided
    const score = parseFloat(formData.score);
    const totalMarks = parseFloat(formData.totalMarks);
    const percentage = ((score / totalMarks) * 100).toFixed(2);

    // Determine grade
    const percentageNum = parseFloat(percentage);
    let grade = 'F';
    if (percentageNum >= 80) grade = 'A+';
    else if (percentageNum >= 80) grade = 'B';
    else if (percentageNum >= 70) grade = 'C';
    else if (percentageNum >= 60) grade = 'D';

    createMutation.mutate({
      studentId: parseInt(formData.studentId),
      classId: parseInt(formData.classId),
      examName: formData.examName,
      score: formData.score,
      totalMarks: formData.totalMarks,
      percentage: percentage,
      grade: grade,
      examDate: formData.examDate,
      remarks: formData.remarks || undefined,
    });
  };

  const handlePublishResults = (classId: number, examName: string) => {
    if (window.confirm(`Publish results for ${examName}? Students will be notified via email.`)) {
      publishMutation.mutate({ classId, examName });
    }
  };

  const handleDeleteResult = (id: number) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
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

  // Get unique exam names for the selected class
  const uniqueExams = Array.from(new Set(results.map((r) => r.examName)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Results Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Exam Result</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateResult} className="space-y-4">

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
                <label className="form-label">Exam Name *</label>
                <Input
                  type="text"
                  placeholder="e.g., Midterm Exam"
                  value={formData.examName}
                  onChange={(e) =>
                    setFormData({ ...formData, examName: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Score *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    step="0.01"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData({ ...formData, score: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="form-label">Total Marks *</label>
                  <Input
                    type="number"
                    placeholder="100"
                    step="0.01"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: e.target.value })
                    }
                    className="input-field"
                  />
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
                  {createMutation.isPending ? 'Creating...' : 'Create Result'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Class Selection */}
      <div>
        <label className="form-label">Select Class to View Results</label>
        <select
          value={selectedClassId || ''}
          onChange={(e) => setSelectedClassId(e.target.value ? parseInt(e.target.value) : null)}
          className="input-field"
        >
          <option value="">Choose a class...</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.className}
            </option>
          ))}
        </select>
      </div>

      {/* Publish Results Section */}
      {selectedClassId && uniqueExams.length > 0 && (
        <Card className="p-4 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-foreground mb-3">Publish Results</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueExams && uniqueExams.map((examName) => (
              <Button
                key={examName}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                onClick={() => handlePublishResults(selectedClassId, examName)}
                disabled={publishMutation.isPending}
              >
                <Send className="w-4 h-4" />
                Publish {examName}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Results Table */}
      {selectedClassId && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="table-header text-left">Student</th>
                <th className="table-header text-left">Exam</th>
                <th className="table-header text-left">Score</th>
                <th className="table-header text-left">Percentage</th>
                <th className="table-header text-left">Grade</th>
                <th className="table-header text-left">Date</th>
                <th className="table-header text-left">Published</th>
                <th className="table-header text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id} className="border-b border-border hover:bg-muted/50">
                  <td className="table-cell">{getStudentName(result.studentId)}</td>
                  <td className="table-cell">{result.examName}</td>
                  <td className="table-cell font-semibold">
                    {result.score}/{result.totalMarks}
                  </td>
                  <td className="table-cell">{result.percentage}%</td>
                  <td className="table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                      {result.grade}
                    </span>
                  </td>
                  <td className="table-cell text-xs">{result.examDate}</td>
                  <td className="table-cell text-xs">
                    {result.publishedDate ? (
                      <span className="badge-success">{result.publishedDate}</span>
                    ) : (
                      <span className="badge-pending">Not Published</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteResult(result.id)}
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
      )}

      {selectedClassId && results.length === 0 && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">No results found for this class.</p>
        </Card>
      )}

      {!selectedClassId && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">Select a class to view results.</p>
        </Card>
      )}
    </div>
  );
}
