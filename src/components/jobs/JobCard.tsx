import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Building2, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  skills: string[];
  postedAt: string;
  logo?: string;
}

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover-lift group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" />
            ) : (
              <Building2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <p className="text-muted-foreground text-sm">{job.company}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-primary transition-colors p-2">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {job.type}
        </div>
        <div className="font-medium text-foreground">{job.salary}</div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.skills.slice(0, 4).map((skill) => (
          <Badge key={skill} variant="secondary" className="font-normal">
            {skill}
          </Badge>
        ))}
        {job.skills.length > 4 && (
          <Badge variant="outline" className="font-normal">
            +{job.skills.length - 4}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{job.postedAt}</span>
        <Button size="sm" asChild>
          <Link to={`/jobs/${job.id}`}>Apply Now</Link>
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
