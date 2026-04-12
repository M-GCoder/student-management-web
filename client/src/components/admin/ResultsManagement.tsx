import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Send, FileBox, File, UploadCloud, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function ResultsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    classId: '',
    examName: '',
    examDate: '',
    remarks: '',
  });

  const [selectedFile, setSelectedFile] = useState<{ name: string, dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  const { data: classes = [] } = trpc.classes.list.useQuery();
  const { data: results = [], refetch } = trpc.results.byClass.useQuery(
    selectedClassId ? { classId: selectedClassId } : { classId: 0 },
    { enabled: !!selectedClassId }
  );

  // Create result mutation
  const createMutation = trpc.results.create.useMutation({
    onSuccess: () => {
      toast.success('Exam result uploaded successfully');
      setFormData({
        classId: selectedClassId ? selectedClassId.toString() : '',
        examName: '',
        examDate: '',
        remarks: '',
      });
      setSelectedFile(null);
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
      toast.success(`Published results and notified ${data.published} class groups`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          dataUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.classId || !formData.examName || !formData.examDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!selectedFile) {
      toast.error('Please upload a result file (Image or PDF)');
      return;
    }

    createMutation.mutate({
      classId: parseInt(formData.classId),
      examName: formData.examName,
      examDate: formData.examDate,
      fileUrl: selectedFile.dataUrl,
      fileName: selectedFile.name,
      remarks: formData.remarks || undefined,
    });
  };

  const handlePublishResults = (classId: number, examName: string) => {
    if (window.confirm(`Publish results for ${examName}? Students will be notified.`)) {
      publishMutation.mutate({ classId, examName });
    }
  };

  const handleDeleteResult = (id: number) => {
    if (window.confirm('Are you sure you want to delete this result file?')) {
      deleteMutation.mutate({ id });
    }
  };

  const getClassName = (id: number) => {
    const classItem = classes.find((c) => c.id === id);
    return classItem ? classItem.className : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Class Results Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
           setIsDialogOpen(open);
           if(open && selectedClassId) setFormData(prev => ({...prev, classId: selectedClassId.toString()}));
        }}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Upload Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Class Result</DialogTitle>
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

              <div>
                <label className="form-label">Exam Date *</label>
                <Input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) =>
                    setFormData({ ...formData, examDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="form-label">Result Document (PDF / Image) *</label>
                {!selectedFile ? (
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="mt-1 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                   >
                     <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                     <p className="text-sm font-medium text-foreground">Click to upload file</p>
                     <p className="text-xs text-muted-foreground mt-1">Supports Images & PDF (Max 5MB)</p>
                   </div>
                ) : (
                  <div className="mt-1 p-3 border border-border rounded-lg flex items-center justify-between bg-muted/30">
                     <div className="flex items-center gap-2 overflow-hidden">
                        <File className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                     </div>
                     <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                        <X className="w-4 h-4" />
                     </Button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="form-label">Remarks (Optional)</label>
                <Input
                  type="text"
                  placeholder="Optional notes"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
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
                  {createMutation.isPending ? 'Uploading...' : 'Upload Result'}
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

      {/* Results Table */}
      {selectedClassId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {results.map((result) => (
             <Card key={result.id} className="p-4 border border-border shadow-sm flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{result.examName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Exam Date: {result.examDate}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                     <FileBox className="w-5 h-5 text-accent" />
                  </div>
                </div>
                
                <div className="bg-muted/30 p-2 rounded-lg mb-4 flex items-center gap-2">
                   <File className="w-4 h-4 text-muted-foreground" />
                   <span className="text-xs font-medium truncate flex-1">{result.fileName}</span>
                   <a 
                     href={result.fileUrl} 
                     download={result.fileName}
                     className="text-xs text-accent hover:underline font-semibold"
                   >
                     View
                   </a>
                </div>

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     {result.publishedDate ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700">
                           Published: {result.publishedDate}
                        </span>
                     ) : (
                        <Button 
                           size="sm" 
                           onClick={() => handlePublishResults(selectedClassId, result.examName)}
                           disabled={publishMutation.isPending}
                           className="h-7 text-xs bg-accent hover:bg-accent/90 text-white px-2"
                        >
                           <Send className="w-3 h-3 mr-1" /> Publish
                        </Button>
                     )}
                   </div>
                   <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteResult(result.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
             </Card>
          ))}
        </div>
      )}

      {selectedClassId && results.length === 0 && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">No results uploaded for this class.</p>
        </Card>
      )}

      {!selectedClassId && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground">Select a class to view its results.</p>
        </Card>
      )}
    </div>
  );
}
