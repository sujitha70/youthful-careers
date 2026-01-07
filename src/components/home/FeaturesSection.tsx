import { FileText, Search, Bell, Building2, Shield, Users } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Job Matching",
    description: "Our algorithm connects you with jobs that match your skills and interests, not just keywords.",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description: "Create a professional resume in minutes with our easy-to-use templates designed for freshers.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get notified immediately when new entry-level positions matching your profile are posted.",
  },
  {
    icon: Building2,
    title: "Verified Employers",
    description: "All companies on our platform are verified to ensure safe and legitimate job opportunities.",
  },
  {
    icon: Shield,
    title: "Application Tracking",
    description: "Track all your applications in one place and never miss an update from recruiters.",
  },
  {
    icon: Users,
    title: "Fresher Community",
    description: "Connect with other job seekers, share tips, and learn from those who've landed their first job.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">
            Built for Your Success
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to land your first job, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 hover-lift border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
