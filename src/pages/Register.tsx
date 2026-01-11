import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Mail, Lock, User, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("role") === "employer" ? "employer" : "fresher";

  // Fresher form state
  const [fresherForm, setFresherForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Employer form state
  const [employerForm, setEmployerForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleFresherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullName = `${fresherForm.firstName} ${fresherForm.lastName}`.trim();
    const { error } = await signUp(fresherForm.email, fresherForm.password, fullName, "fresher");

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Account created!",
      description: "Welcome to FresherConnect. Let's set up your profile.",
    });
    navigate("/dashboard");
  };

  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(employerForm.email, employerForm.password, employerForm.contactName, "employer");

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Account created!",
      description: "Welcome to FresherConnect. Start posting jobs to find talent.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-blue-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 text-center text-primary-foreground max-w-md">
          <h2 className="font-poppins font-bold text-3xl mb-4">
            Your Future Starts Here
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Whether you're a fresh graduate or looking to hire top talent, we've got you covered.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-poppins font-bold text-xl text-foreground">
              Fresher<span className="text-primary">Connect</span>
            </span>
          </Link>

          <h1 className="text-2xl md:text-3xl font-poppins font-bold text-foreground mb-2">
            Create your account
          </h1>
          <p className="text-muted-foreground mb-8">
            Get started in just a few minutes
          </p>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="fresher" className="gap-2">
                <User className="w-4 h-4" />
                Job Seeker
              </TabsTrigger>
              <TabsTrigger value="employer" className="gap-2">
                <Building2 className="w-4 h-4" />
                Employer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fresher">
              <form onSubmit={handleFresherSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="mt-2 h-11"
                      value={fresherForm.firstName}
                      onChange={(e) => setFresherForm({ ...fresherForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="mt-2 h-11"
                      value={fresherForm.lastName}
                      onChange={(e) => setFresherForm({ ...fresherForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-11 h-11"
                      value={fresherForm.email}
                      onChange={(e) => setFresherForm({ ...fresherForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      className="pl-11 h-11"
                      value={fresherForm.password}
                      onChange={(e) => setFresherForm({ ...fresherForm, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <Button type="submit" size="lg" className="w-full h-12 mt-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Create Account
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="employer">
              <form onSubmit={handleEmployerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name
                  </Label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="Your Company Inc."
                      className="pl-11 h-11"
                      value={employerForm.companyName}
                      onChange={(e) => setEmployerForm({ ...employerForm, companyName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactName" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="contactName"
                      placeholder="Jane Smith"
                      className="pl-11 h-11"
                      value={employerForm.contactName}
                      onChange={(e) => setEmployerForm({ ...employerForm, contactName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessEmail" className="text-sm font-medium">
                    Business Email
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="hr@company.com"
                      className="pl-11 h-11"
                      value={employerForm.email}
                      onChange={(e) => setEmployerForm({ ...employerForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessPassword" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="businessPassword"
                      type="password"
                      placeholder="Create a password"
                      className="pl-11 h-11"
                      value={employerForm.password}
                      onChange={(e) => setEmployerForm({ ...employerForm, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full h-12 mt-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Register Company
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
