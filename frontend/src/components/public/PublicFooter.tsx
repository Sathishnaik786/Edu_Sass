
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export const PublicFooter: React.FC = () => {
    return (
        <footer className="bg-muted/30 border-t py-12">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span>EduPlatform</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Empowering academic excellence through streamlined admission and management processes.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Admissions</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/admissions" className="hover:text-primary transition-colors">How to Apply</Link></li>
                        <li><Link to="/admissions" className="hover:text-primary transition-colors">PhD Requirements</Link></li>
                        <li><Link to="/admissions" className="hover:text-primary transition-colors">Important Dates</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
                        <li><Link to="/login" className="hover:text-primary transition-colors">Staff Login</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4">Contact</h4>
                    <p className="text-sm text-muted-foreground mb-2">University Campus, Main Block</p>
                    <p className="text-sm text-muted-foreground mb-2">+91 123 456 7890</p>
                    <p className="text-sm text-muted-foreground">admissions@eduplatform.ac.in</p>
                </div>
            </div>
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} EduPlatform. All rights reserved.
            </div>
        </footer>
    );
};
