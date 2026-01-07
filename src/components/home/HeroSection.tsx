import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4" />
            <span>Exclusively for Fresh Graduates</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Launch Your Career with{" "}
            <span className="text-gradient">Confidence</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            The first job portal designed specifically for freshers. No experience required—just your potential and ambition.
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl p-3 shadow-card max-w-3xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Job title, skills, or company"
                  className="pl-12 h-12 border-0 bg-secondary/50 focus-visible:ring-1"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="City or remote"
                  className="pl-12 h-12 border-0 bg-secondary/50 focus-visible:ring-1"
                />
              </div>
              <Button size="lg" className="h-12 px-8" asChild>
                <Link to="/jobs">
                  Search Jobs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "5,000+", label: "Entry-Level Jobs" },
              { value: "2,500+", label: "Companies Hiring" },
              { value: "50,000+", label: "Freshers Placed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-poppins font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
