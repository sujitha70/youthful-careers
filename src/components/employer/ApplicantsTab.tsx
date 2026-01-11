import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Mail, Phone, FileText, ExternalLink, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  applied_at: string;
  resume_id: string | null;
  job: {
    title: string;
    company: string;
  };
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
    skills: string[] | null;
    education: string | null;
    linkedin_url: string | null;
  };
  resume: {
    file_name: string;
    file_path: string;
  } | null;
}

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shortlisted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  hired: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const ApplicantsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (user) {
      fetchJobsAndApplications();
    }
  }, [user]);

  const fetchJobsAndApplications = async () => {
    try {
      // First fetch employer's jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", user?.id);

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      if (!jobsData || jobsData.length === 0) {
        setLoading(false);
        return;
      }

      // Then fetch applications for those jobs
      const jobIds = jobsData.map(job => job.id);
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("applications")
        .select(`
          id,
          job_id,
          user_id,
          status,
          cover_letter,
          applied_at,
          resume_id
        `)
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });

      if (applicationsError) throw applicationsError;

      // Fetch profile and resume data for each application
      const enrichedApplications: Application[] = [];
      for (const app of applicationsData || []) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email, phone, skills, education, linkedin_url")
          .eq("user_id", app.user_id)
          .single();

        let resumeData = null;
        if (app.resume_id) {
          const { data } = await supabase
            .from("resumes")
            .select("file_name, file_path")
            .eq("id", app.resume_id)
            .single();
          resumeData = data;
        }

        const job = jobsData.find(j => j.id === app.job_id);

        enrichedApplications.push({
          ...app,
          job: {
            title: job?.title || "Unknown",
            company: "",
          },
          profile: profileData || {
            full_name: "Unknown",
            email: "",
            phone: null,
            skills: null,
            education: null,
            linkedin_url: null,
          },
          resume: resumeData,
        });
      }

      setApplications(enrichedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    }
  };

  const downloadResume = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("resumes")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Error",
        description: "Failed to download resume.",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = selectedJob === "all"
    ? applications
    : applications.filter(app => app.job_id === selectedJob);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
          <p className="text-muted-foreground">Post a job first to start receiving applications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Applicants</CardTitle>
              <CardDescription>
                Review and manage applications for your jobs
              </CardDescription>
            </div>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground">Applications will appear here when candidates apply.</p>
          </CardContent>
        </Card>
      ) : (
        filteredApplications.map((application) => (
          <Card key={application.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {application.profile.full_name}
                    </h3>
                    <Badge className={statusColors[application.status]}>
                      {application.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    Applied for: <span className="font-medium">{application.job.title}</span>
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <a 
                      href={`mailto:${application.profile.email}`}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <Mail className="w-4 h-4" />
                      {application.profile.email}
                    </a>
                    {application.profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {application.profile.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Applied {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                    </span>
                    {application.profile.linkedin_url && (
                      <a
                        href={application.profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>

                  {application.profile.education && (
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>Education:</strong> {application.profile.education}
                    </p>
                  )}

                  {application.profile.skills && application.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {application.profile.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {application.cover_letter && (
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-sm mb-2">Cover Letter</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <Select
                    value={application.status}
                    onValueChange={(value: ApplicationStatus) => 
                      updateApplicationStatus(application.id, value)
                    }
                  >
                    <SelectTrigger className="w-full lg:w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>

                  {application.resume && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResume(application.resume!.file_path, application.resume!.file_name)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ApplicantsTab;
