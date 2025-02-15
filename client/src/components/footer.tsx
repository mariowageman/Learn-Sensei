import { Link } from "wouter";
import { Instagram, Linkedin } from "lucide-react";
import { RiTwitterXFill } from "react-icons/ri";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Learn Sensei</h3>
            <p className="text-sm text-muted-foreground">
              Empowering learners worldwide with AI-powered education and personalized learning paths.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/learnsenseiai/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/LearnSensei" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                <RiTwitterXFill className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/learn-sensei/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sensei">
                  <a className="text-sm text-muted-foreground hover:text-[#3F3EED]">Sensei Mode</a>
                </Link>
              </li>
              <li>
                <Link href="/learning-paths">
                  <a className="text-sm text-muted-foreground hover:text-[#3F3EED]">Learning Paths</a>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <a className="text-sm text-muted-foreground hover:text-[#3F3EED]">Dashboard</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Blog</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Support</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Privacy Policy</a>
              </li>
              <li>
                <Link href="/cookie-policy">
                  <a className="text-sm text-muted-foreground hover:text-[#3F3EED]">Cookie Policy</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Learn Sensei. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
}