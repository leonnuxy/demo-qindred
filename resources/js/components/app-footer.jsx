import { Link } from '@inertiajs/react';
import { Instagram, Twitter, Facebook, Linkedin, Github, Heart } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';
import '@css/footer.css';

export function AppFooter() {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: <Facebook className="size-[18px] md:size-[18px]" />, href: "https://facebook.com", label: "Facebook" },
        { icon: <Twitter className="size-[18px] md:size-[18px]" />, href: "https://twitter.com", label: "Twitter" },
        { icon: <Instagram className="size-[18px] md:size-[18px]" />, href: "https://instagram.com", label: "Instagram" },
        { icon: <Linkedin className="size-[18px] md:size-[18px]" />, href: "https://linkedin.com", label: "LinkedIn" },
        { icon: <Github className="size-[18px] md:size-[18px]" />, href: "https://github.com", label: "GitHub" },
    ];

    const footerLinks = [
        { href: "/about", label: "About" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/contact", label: "Contact Us" },
        { href: "/help", label: "Help" },
        { href: "/faq", label: "FAQ" },
    ];

    return (
        <footer className="site-footer mt-auto">
            <div className="footer-wrapper">
                <div className="footer-content">
                    <div className="footer-row">
                        <div className="footer-left">
                            <AppLogoIcon variant="footer" />
                            <div className="social-links">
                                {socialLinks.map((link, index) => (
                                    <a 
                                        key={index} 
                                        href={link.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="social-link"
                                        aria-label={link.label}
                                    >
                                        {link.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        <nav className="footer-links">
                            {footerLinks.map((link, index) => (
                                <Link 
                                    key={index} 
                                    className="footer-link" 
                                    href={link.href}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <p className="copyright">
                            © {currentYear} Qindred. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}