import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Briefcase, Users, BarChart3 } from "lucide-react";
import JobPostingTab from "@/components/employer/JobPostingTab";
import MyJobsTab from "@/components/employer/MyJobsTab";
import ApplicantsTab from "@/components/employer/ApplicantsTab";

const EmployerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEmployer, setIsEmployer] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "employer")
        .maybeSingle();

      if (error) {
        console.error("Error checking role:", error);
        setIsEmployer(false);
      } else {
        setIsEmployer(!!data);
      }
      setLoading(false);
    };

    if (user) {
      checkRole();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You need to be an employer to access this dashboard.</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-poppins font-bold text-foreground mb-2">
              Employer Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your job postings and view applicants
            </p>
          </div>

          <Tabs defaultValue="post-job" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="post-job" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Post a Job
              </TabsTrigger>
              <TabsTrigger value="my-jobs" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                My Jobs
              </TabsTrigger>
              <TabsTrigger value="applicants" className="gap-2">
                <Users className="w-4 h-4" />
                Applicants
              </TabsTrigger>
            </TabsList>

            <TabsContent value="post-job">
              <JobPostingTab />
            </TabsContent>

            <TabsContent value="my-jobs">
              <MyJobsTab />
            </TabsContent>

            <TabsContent value="applicants">
              <ApplicantsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmployerDashboard;
