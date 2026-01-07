import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobCard, { Job } from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Grid, List } from "lucide-react";

// Sample job data
const sampleJobs: Job[] = [
  {
    id: "1",
    title: "Junior Software Developer",
    company: "TechStart Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$55,000 - $70,000",
    skills: ["JavaScript", "React", "Node.js", "Git"],
    postedAt: "Posted 2 days ago",
  },
  {
    id: "2",
    title: "Marketing Coordinator",
    company: "GrowthLabs",
    location: "Remote",
    type: "Full-time",
    salary: "$45,000 - $55,000",
    skills: ["Social Media", "Content Writing", "Analytics", "SEO"],
    postedAt: "Posted 1 day ago",
  },
  {
    id: "3",
    title: "Data Analyst Intern",
    company: "DataVision Co.",
    location: "New York, NY",
    type: "Internship",
    salary: "$25/hour",
    skills: ["Python", "SQL", "Excel", "Tableau"],
    postedAt: "Posted 3 days ago",
  },
  {
    id: "4",
    title: "UI/UX Design Associate",
    company: "DesignHub",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$50,000 - $65,000",
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    postedAt: "Posted today",
  },
  {
    id: "5",
    title: "Business Development Trainee",
    company: "SalesForce Pro",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$48,000 + Commission",
    skills: ["Communication", "CRM", "Negotiation", "MS Office"],
    postedAt: "Posted 5 days ago",
  },
  {
    id: "6",
    title: "Content Writer",
    company: "MediaMind",
    location: "Remote",
    type: "Part-time",
    salary: "$20 - $30/hour",
    skills: ["Copywriting", "SEO", "Research", "WordPress"],
    postedAt: "Posted 1 week ago",
  },
];

const Jobs = () => {
  const [showFilters, setShowFilters] = useState(false);

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
              {sampleJobs.length} opportunities waiting for you
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
                {sampleJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-10">
                <Button variant="outline" size="lg">
                  Load More Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;
