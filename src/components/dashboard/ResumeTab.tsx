import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Trash2, Star, Download } from "lucide-react";
import { format } from "date-fns";

interface Resume {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  is_primary: boolean;
  uploaded_at: string;
}

const ResumeTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user?.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase.from("resumes").insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        is_primary: resumes.length === 0,
      });

      if (dbError) throw dbError;

      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });

      fetchResumes();
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (resume: Resume) => {
    try {
      // Delete from storage
      await supabase.storage.from("resumes").remove([resume.file_path]);

      // Delete from database
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resume.id);

      if (error) throw error;

      toast({
        title: "Resume deleted",
        description: "Your resume has been deleted.",
      });

      fetchResumes();
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    try {
      // Remove primary from all
      await supabase
        .from("resumes")
        .update({ is_primary: false })
        .eq("user_id", user?.id);

      // Set new primary
      const { error } = await supabase
        .from("resumes")
        .update({ is_primary: true })
        .eq("id", resumeId);

      if (error) throw error;

      toast({
        title: "Primary resume updated",
        description: "This resume will be used by default for applications.",
      });

      fetchResumes();
    } catch (error) {
      console.error("Error setting primary resume:", error);
      toast({
        title: "Update failed",
        description: "Failed to update primary resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      const { data, error } = await supabase.storage
        .from("resumes")
        .download(resume.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = resume.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download failed",
        description: "Failed to download resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Management</CardTitle>
        <CardDescription>
          Upload and manage your resumes. You can have multiple resumes and set one as primary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            className="hidden"
            id="resume-upload"
          />
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Upload Your Resume</h3>
          <p className="text-sm text-muted-foreground mb-4">
            PDF format only, max 5MB
          </p>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload Resume
          </Button>
        </div>

        {/* Resumes List */}
        {resumes.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Your Resumes</h3>
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{resume.file_name}</span>
                      {resume.is_primary && (
                        <Badge variant="default" className="gap-1">
                          <Star className="w-3 h-3" /> Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(resume.file_size)} • Uploaded{" "}
                      {format(new Date(resume.uploaded_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!resume.is_primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(resume.id)}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(resume)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(resume)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resumes.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No resumes uploaded yet. Upload your first resume to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeTab;
