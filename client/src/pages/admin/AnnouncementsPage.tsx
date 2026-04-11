import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Edit2, Calendar, Home, BookOpen, DollarSign, BarChart3, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function AnnouncementsPage() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classId, setClassId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch classes for dropdown
  const { data: classes = [] } = trpc.classes.list.useQuery();

  // Fetch announcements
  const { data: announcements = [], refetch: refetchAnnouncements } = trpc.announcements.list.useQuery();

  // Create/Update announcement mutation
  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success(editingId ? "Announcement updated successfully" : "Announcement created successfully");
      resetForm();
      refetchAnnouncements();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save announcement");
    },
  });

  const updateMutation = trpc.announcements.update.useMutation({
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      resetForm();
      refetchAnnouncements();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });

  // Delete announcement mutation
  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      refetchAnnouncements();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setClassId("");
    setExpiresAt("");
    setImageUrl("");
    setDocumentUrl("");
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !classId || !expiresAt) {
      toast.error("Please fill in all required fields");
      return;
    }

    const expirationDate = new Date(expiresAt);

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        title,
        description,
        imageUrl: imageUrl || undefined,
        documentUrl: documentUrl || undefined,
        expiresAt: expirationDate,
      });
    } else {
      createMutation.mutate({
        classId: parseInt(classId),
        title,
        description,
        imageUrl: imageUrl || undefined,
        documentUrl: documentUrl || undefined,
        expiresAt: expirationDate,
      });
    }
  };

  const handleEdit = (announcement: any) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setDescription(announcement.description);
    setClassId(announcement.classId.toString());
    setImageUrl(announcement.imageUrl || "");
    setDocumentUrl(announcement.documentUrl || "");
    setExpiresAt(announcement.expiresAt.split("T")[0]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getClassName = (classId: number) => {
    const cls = classes.find((c: any) => c.id === classId);
    return cls?.className || `Class ${classId}`;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/home")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form Section */}
        <Card className="p-6 mb-8 border border-border shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-foreground">
            {editingId ? "Edit Announcement" : "Create New Announcement"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <Input
                  placeholder="Announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class *
                </label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <Textarea
                placeholder="Announcement description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="border-border"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expires At *
                </label>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL (Optional)
                </label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="border-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Document URL (Optional)
              </label>
              <Input
                placeholder="https://example.com/document.pdf"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="border-border"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update" : "Push"} Announcement
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Announcements List */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-foreground">
            All Announcements ({announcements.length})
          </h2>

          {announcements.length === 0 ? (
            <Card className="p-8 text-center border border-border shadow-sm">
              <p className="text-muted-foreground">No announcements yet. Create one to get started!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {announcements.map((announcement: any) => (
                <Card
                  key={announcement.id}
                  className={`p-6 border shadow-sm ${
                    isExpired(announcement.expiresAt)
                      ? "border-red-200 bg-red-50"
                      : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {announcement.title}
                      </h3>
                      <div className="flex gap-3 text-sm mb-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          {getClassName(announcement.classId)}
                        </span>
                        {isExpired(announcement.expiresAt) && (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <p className="text-foreground mb-4 line-clamp-3">{announcement.description}</p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Expires: {new Date(announcement.expiresAt).toLocaleDateString()} at{" "}
                      {new Date(announcement.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {(announcement.imageUrl || announcement.documentUrl) && (
                    <div className="mt-4 flex gap-2">
                      {announcement.imageUrl && (
                        <a
                          href={announcement.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Image
                        </a>
                      )}
                      {announcement.documentUrl && (
                        <a
                          href={announcement.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-around py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/admin/home")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <Home className="w-6 h-6" />
                <span className="text-xs font-medium">Home</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Home</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/admin/classes")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="w-6 h-6" />
                <span className="text-xs font-medium">Class</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Class</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/admin/payments")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-xs font-medium">Payments</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Payments</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/admin/results")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs font-medium">Results</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Results</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/admin/announcements")}
                className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors text-green-600 bg-green-50"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-xs font-medium">Announcements</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Announcements</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
