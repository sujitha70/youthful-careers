import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Building } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Job Seekers */}
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-8 md:p-10 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="font-poppins font-bold text-2xl md:text-3xl mb-4">
                Ready to Start Your Career?
              </h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Create your free account today and discover thousands of entry-level opportunities tailored just for you.
              </p>
              <Button variant="heroOutline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* For Employers */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Building className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-poppins font-bold text-2xl md:text-3xl text-foreground mb-4">
                Hiring Fresh Talent?
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Access a pool of motivated, eager-to-learn candidates ready to make an impact at your company.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/register?role=employer">
                  Post a Job
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
