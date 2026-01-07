import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar,
  Bookmark,
  Share2
} from "lucide-react";

// Sample job data (would come from API in real app)
const sampleJobs = [
  {
    id: "1",
    title: "Junior Software Developer",
    company: "TechStart Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$55,000 - $70,000",
    skills: ["JavaScript", "React", "Node.js", "Git"],
    postedAt: "Posted 2 days ago",
    description: "We're looking for a passionate Junior Software Developer to join our growing team. You'll work on exciting projects using modern technologies and have the opportunity to learn from experienced developers.",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "Basic understanding of JavaScript and React",
      "Familiarity with version control (Git)",
      "Strong problem-solving skills",
      "Excellent communication abilities"
    ],
    benefits: [
      "Competitive salary with annual reviews",
      "Health, dental, and vision insurance",
      "Flexible work hours",
      "Remote work options",
      "Professional development budget"
    ],
    companyDescription: "TechStart Inc. is an innovative technology company focused on building solutions that help businesses grow. We value creativity, collaboration, and continuous learning."
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
    description: "Join our marketing team to help drive brand awareness and customer engagement through creative campaigns and data-driven strategies.",
    requirements: [
      "Bachelor's degree in Marketing or related field",
      "Experience with social media platforms",
      "Strong writing and communication skills",
      "Basic understanding of SEO principles",
      "Analytical mindset"
    ],
    benefits: [
      "Fully remote position",
      "Flexible schedule",
      "Health benefits",
      "Learning stipend",
      "Team retreats"
    ],
    companyDescription: "GrowthLabs helps startups and SMBs scale their marketing efforts through data-driven strategies and creative campaigns."
  },
];

const JobDetails = () => {
  const { id } = useParams();
  const job = sampleJobs.find(j => j.id === id);

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
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.salary}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {job.postedAt}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-poppins font-semibold mb-4">About the Role</h2>
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>
              </div>

              {/* Requirements */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-poppins font-semibold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-xl font-poppins font-semibold mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <Button className="w-full mb-3" size="lg">
                  Apply Now
                </Button>
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
                  {job.companyDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetails;