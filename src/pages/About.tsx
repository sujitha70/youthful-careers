import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Users, Target, Heart, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const stats = [
    { value: "50,000+", label: "Freshers Placed" },
    { value: "2,500+", label: "Partner Companies" },
    { value: "100+", label: "Cities Covered" },
    { value: "95%", label: "Success Rate" },
  ];

  const values = [
    {
      icon: Target,
      title: "Fresher-First",
      description: "Every feature we build is designed with fresh graduates in mind.",
    },
    {
      icon: Heart,
      title: "Empathy",
      description: "We understand the challenges of finding your first job.",
    },
    {
      icon: Award,
      title: "Quality",
      description: "We verify every employer to ensure safe opportunities.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a supportive network of freshers and mentors.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-6">
              Bridging the Gap Between{" "}
              <span className="text-gradient">Talent & Opportunity</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              FresherConnect was founded with a simple mission: make it easier for fresh graduates to find meaningful employment and for companies to discover exceptional emerging talent.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-primary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center text-primary-foreground">
                  <div className="text-3xl md:text-4xl font-poppins font-bold mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We started FresherConnect after experiencing firsthand the frustrations of job hunting as fresh graduates. The endless cycle of "entry-level jobs requiring 3+ years experience" was disheartening.
                  </p>
                  <p>
                    We realized that the problem wasn't a lack of opportunities—it was a lack of the right platform connecting fresh talent with companies willing to invest in potential over experience.
                  </p>
                  <p>
                    Today, we're proud to have helped thousands of freshers land their first jobs and kickstart their careers. But we're just getting started.
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
                <blockquote className="text-lg md:text-xl font-medium text-foreground italic">
                  "Everyone deserves a fair chance at their first job. That's not just our mission—it's our promise."
                </blockquote>
                <div className="mt-4 text-muted-foreground">— The FresherConnect Team</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-card rounded-xl p-6 text-center hover-lift border border-border/50"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join the community of freshers who are building their futures with FresherConnect.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
