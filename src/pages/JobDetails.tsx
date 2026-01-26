import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ApplyModal from "@/components/jobs/ApplyModal";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar,
  Bookmark,
  Share2,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string | null;
  skills: string[] | null;
  description: string | null;
  requirements: string | null;
  created_at: string;
  employer_id: string;
}

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      if (user) {
        checkExistingApplication();
      }
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error("Error fetching job:", error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Posted today";
    if (diffInDays === 1) return "Posted 1 day ago";
    if (diffInDays < 7) return `Posted ${diffInDays} days ago`;
    if (diffInDays < 14) return "Posted 1 week ago";
    return `Posted ${Math.floor(diffInDays / 7)} weeks ago`;
  };

  const parseRequirements = (requirements: string | null): string[] => {
    if (!requirements) return [];
    return requirements.split('\n').filter(req => req.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link 
            to="/jobs" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-poppins font-bold text-foreground">{job.title}</h1>
                      <p className="text-primary font-medium">{job.company}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatTimeAgo(job.created_at)}
                  </span>
                </div>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {job.description && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-poppins font-semibold mb-4">About the Role</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-poppins font-semibold mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {parseRequirements(job.requirements).map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                {hasApplied ? (
                  <div className="text-center py-4">
                    <Badge variant="secondary" className="mb-2">Already Applied</Badge>
                    <p className="text-sm text-muted-foreground">You've already applied for this job</p>
                  </div>
                ) : (
                  <Button 
                    className="w-full mb-3" 
                    size="lg"
                    onClick={() => setIsApplyModalOpen(true)}
                  >
                    Apply Now
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-poppins font-semibold mb-3">About {job.company}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Apply now to learn more about this exciting opportunity at {job.company}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        company={job.company}
        onApplicationSubmitted={() => setHasApplied(true)}
      />
    </div>
  );
};

export default JobDetails;
