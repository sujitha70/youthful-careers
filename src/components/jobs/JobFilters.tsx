import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";

interface JobFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobFilters = ({ isOpen, onClose }: JobFiltersProps) => {
  const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];
  const experienceLevels = ["Entry Level", "Junior", "No Experience Required"];
  const locations = ["Remote", "On-site", "Hybrid"];

  return (
    <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
      <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h3 className="font-poppins font-semibold text-lg">Filters</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Job title or keyword" className="pl-10" />
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-2 block">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="City or remote" className="pl-10" />
          </div>
        </div>

        {/* Job Type */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Job Type</Label>
          <div className="space-y-3">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center gap-3">
                <Checkbox id={type} />
                <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Experience Level</Label>
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <div key={level} className="flex items-center gap-3">
                <Checkbox id={level} />
                <Label htmlFor={level} className="text-sm font-normal cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Work Location */}
        <div className="mb-6">
          <Label className="text-sm font-medium mb-3 block">Work Location</Label>
          <div className="space-y-3">
            {locations.map((loc) => (
              <div key={loc} className="flex items-center gap-3">
                <Checkbox id={loc} />
                <Label htmlFor={loc} className="text-sm font-normal cursor-pointer">
                  {loc}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default JobFilters;
