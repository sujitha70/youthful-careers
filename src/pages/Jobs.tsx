import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobCard, { Job } from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import JobChatbot from "@/components/chat/JobChatbot";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Grid, List, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Jobs = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedJobs: Job[] = (data || []).map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary || undefined,
        skills: job.skills || [],
        postedAt: `Posted ${formatTimeAgo(new Date(job.created_at))}`,
      }));

      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return "1 week ago";
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-2">
              Find Entry-Level Jobs
            </h1>
            <p className="text-muted-foreground">
              {jobs.length} opportunities waiting for you
            </p>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-80 shrink-0">
              <JobFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
            </aside>

            {/* Job Listings */}
            <div className="flex-1">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <select className="text-sm border border-border rounded-lg px-3 py-2 bg-card">
                  <option>Most Recent</option>
                  <option>Salary: High to Low</option>
                  <option>Salary: Low to High</option>
                </select>
              </div>

              {/* Job Grid */}
              <div className="grid gap-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No jobs available at the moment.</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                )}
              </div>

              {/* Load More */}
              {!loading && jobs.length > 0 && (
                <div className="text-center mt-10">
                  <Button variant="outline" size="lg">
                    Load More Jobs
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <JobChatbot />
    </div>
  );
};

export default Jobs;
