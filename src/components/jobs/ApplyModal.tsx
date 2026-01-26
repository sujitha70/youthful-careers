import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  company: string;
  onApplicationSubmitted?: () => void;
}

interface Resume {
  id: string;
  file_name: string;
  file_path: string;
  is_primary: boolean;
}

const ApplyModal = ({ isOpen, onClose, jobId, jobTitle, company, onApplicationSubmitted }: ApplyModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [existingResumes, setExistingResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [useNewResume, setUseNewResume] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && user) {
      fetchExistingResumes();
    }
  }, [isOpen, user]);

  const fetchExistingResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, file_name, file_path, is_primary")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;

      setExistingResumes(data || []);
      
      // Auto-select primary resume if available
      const primaryResume = data?.find(r => r.is_primary);
      if (primaryResume) {
        setSelectedResumeId(primaryResume.id);
      } else if (data && data.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!user) {
      newErrors.auth = "You must be logged in to apply";
    }

    if (!selectedResumeId && !resume && !useNewResume) {
      newErrors.resume = "Please select or upload a resume";
    }

    if (useNewResume && !resume) {
      newErrors.resume = "Please upload a resume";
    }

    if (coverLetter.length > 2000) {
      newErrors.coverLetter = "Cover letter must be less than 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, resume: "Only PDF files are accepted" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: "File size must be less than 5MB" }));
        return;
      }
      setResume(file);
      setUseNewResume(true);
      setSelectedResumeId(null);
      setErrors((prev) => {
        const { resume, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);
    
    try {
      let resumeIdToUse = selectedResumeId;

      // Upload new resume if provided
      if (useNewResume && resume) {
        const fileExt = resume.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, resume);

        if (uploadError) throw uploadError;

        // Create resume record
        const { data: resumeData, error: resumeError } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            file_name: resume.name,
            file_path: fileName,
            file_size: resume.size,
            is_primary: existingResumes.length === 0,
          })
          .select()
          .single();

        if (resumeError) throw resumeError;
        resumeIdToUse = resumeData.id;
      }

      // Create application
      const { error: applicationError } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          user_id: user.id,
          resume_id: resumeIdToUse,
          cover_letter: coverLetter || null,
          status: "pending",
        });

      if (applicationError) {
        if (applicationError.code === "23505") {
          throw new Error("You have already applied for this job");
        }
        throw applicationError;
      }

      setIsSuccess(true);
      
      toast({
        title: "Application Submitted!",
        description: `Your application for ${jobTitle} at ${company} has been submitted successfully.`,
      });

      onApplicationSubmitted?.();

      // Reset after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setCoverLetter("");
        setResume(null);
        setUseNewResume(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      setIsSuccess(false);
      setCoverLetter("");
      setResume(null);
      setUseNewResume(false);
      onClose();
    }
  };

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-poppins text-xl">Sign in Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to apply for jobs
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Please sign in to your account to apply for this position.</p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins text-xl">Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application to {company}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground">We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Resume Selection */}
            <div className="space-y-3">
              <Label>Resume *</Label>
              
              {existingResumes.length > 0 && !useNewResume && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Select from your uploaded resumes:</p>
                  {existingResumes.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedResumeId === r.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="resume"
                        checked={selectedResumeId === r.id}
                        onChange={() => {
                          setSelectedResumeId(r.id);
                          setUseNewResume(false);
                          setResume(null);
                        }}
                        className="sr-only"
                      />
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="flex-1 text-sm truncate">{r.file_name}</span>
                      {r.is_primary && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Primary</span>
                      )}
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setUseNewResume(true);
                      setSelectedResumeId(null);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Or upload a new resume
                  </button>
                </div>
              )}

              {(existingResumes.length === 0 || useNewResume) && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {resume ? (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{resume.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(resume.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setResume(null);
                          if (existingResumes.length > 0) {
                            setUseNewResume(false);
                            setSelectedResumeId(existingResumes[0].id);
                          }
                        }}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full p-6 border-2 border-dashed rounded-lg text-center hover:border-primary hover:bg-primary/5 transition-colors ${
                        errors.resume ? "border-destructive" : "border-border"
                      }`}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload your resume</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF only, max 5MB</p>
                    </button>
                  )}

                  {existingResumes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseNewResume(false);
                        setResume(null);
                        setSelectedResumeId(existingResumes[0].id);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Use existing resume instead
                    </button>
                  )}
                </>
              )}

              {errors.resume && (
                <p className="text-sm text-destructive">{errors.resume}</p>
              )}
            </div>

            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit for this role..."
                rows={4}
                className={errors.coverLetter ? "border-destructive" : ""}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {errors.coverLetter ? (
                  <p className="text-destructive">{errors.coverLetter}</p>
                ) : (
                  <span />
                )}
                <span>{coverLetter.length}/2000</span>
              </div>
            </div>

            {errors.auth && (
              <p className="text-sm text-destructive text-center">{errors.auth}</p>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplyModal;
