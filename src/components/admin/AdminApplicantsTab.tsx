import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Mail, Phone, FileText, ExternalLink, Calendar, Search, GraduationCap, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface AdminApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  applied_at: string;
  resume_id: string | null;
  job: { title: string; company: string };
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
    skills: string[] | null;
    education: string | null;
    graduation_year: number | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
  };
  resume: { file_name: string; file_path: string } | null;
}

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shortlisted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  hired: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const AdminApplicantsTab = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: apps, error } = await supabase
        .from("applications")
        .select("id, job_id, user_id, status, cover_letter, applied_at, resume_id")
        .order("applied_at", { ascending: false });

      if (error) throw error;

      const enriched: AdminApplication[] = [];
      for (const app of apps || []) {
        const [{ data: profile }, { data: job }, resumeRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, email, phone, skills, education, graduation_year, linkedin_url, portfolio_url")
            .eq("user_id", app.user_id)
            .maybeSingle(),
          supabase.from("jobs").select("title, company").eq("id", app.job_id).maybeSingle(),
          app.resume_id
            ? supabase.from("resumes").select("file_name, file_path").eq("id", app.resume_id).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);

        enriched.push({
          ...app,
          job: job || { title: "Unknown", company: "" },
          profile: profile || {
            full_name: "Unknown",
            email: "",
            phone: null,
            skills: null,
            education: null,
            graduation_year: null,
            linkedin_url: null,
            portfolio_url: null,
          },
          resume: (resumeRes as any).data || null,
        });
      }

      setApplications(enriched);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load applications.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: ApplicationStatus) => {
    try {
      const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      toast({ title: "Status updated", description: `Changed to ${newStatus}.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const downloadResume = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from("resumes").download(filePath);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to download resume.", variant: "destructive" });
    }
  };

  const filtered = applications.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.profile.full_name.toLowerCase().includes(q) ||
        a.profile.email.toLowerCase().includes(q) ||
        a.job.title.toLowerCase().includes(q) ||
        a.job.company.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Applicants</CardTitle>
              <CardDescription>
                {applications.length} total applications across all jobs
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, job..."
                  className="pl-9 w-full sm:w-[260px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground">Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        filtered.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground">{app.profile.full_name}</h3>
                    <Badge className={statusColors[app.status]}>{app.status}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    Applied for: <span className="font-medium text-foreground">{app.job.title}</span>
                    {app.job.company && <> at <span className="font-medium">{app.job.company}</span></>}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <a href={`mailto:${app.profile.email}`} className="flex items-center gap-1 hover:text-primary">
                      <Mail className="w-4 h-4" /> {app.profile.email}
                    </a>
                    {app.profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {app.profile.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                    </span>
                    {app.profile.linkedin_url && (
                      <a href={app.profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <ExternalLink className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                    {app.profile.portfolio_url && (
                      <a href={app.profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <ExternalLink className="w-4 h-4" /> Portfolio
                      </a>
                    )}
                  </div>

                  {(app.profile.education || app.profile.graduation_year) && (
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {app.profile.education}
                      {app.profile.graduation_year && <> • {app.profile.graduation_year}</>}
                    </p>
                  )}

                  {app.profile.skills && app.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.profile.skills.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}

                  {app.cover_letter && (
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-sm mb-2">Cover Letter</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.cover_letter}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <Select value={app.status} onValueChange={(v: ApplicationStatus) => updateStatus(app.id, v)}>
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

                  {app.resume && (
                    <Button variant="outline" size="sm" onClick={() => downloadResume(app.resume!.file_path, app.resume!.file_name)}>
                      <FileText className="w-4 h-4 mr-2" /> Download Resume
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

export default AdminApplicantsTab;
