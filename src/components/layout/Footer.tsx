import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

const Footer = forwardRef<HTMLElement>((props, ref) => {
  return (
    <footer ref={ref} className="bg-foreground text-background" {...props}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-poppins font-bold text-xl">
                Fresher<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              The premier job portal designed exclusively for fresh graduates.
              Launch your career with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Find Jobs", "For Employers", "About Us", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    to="#"
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              {["Career Tips", "Resume Builder", "Interview Prep", "Blog"].map((link) => (
                <li key={link}>
                  <Link
                    to="#"
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                hello@fresherconnect.com
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} FresherConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});
Footer.displayName = "Footer";

export default Footer;