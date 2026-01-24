import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get the redirect path from URL params, default to /admission/dashboard
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/admission/dashboard';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: loginError } = await login(email, password);

        if (loginError) {
            setError(loginError.message || 'Invalid email or password');
            setLoading(false);
        } else {
            // Central Routing Logic (Database Driven)
            // Fetch Role from DB (iers_user_roles)
            // Note: We use the session user ID we just got or assume success. 
            // Better to get session again to be sure of ID.
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data: roleData } = await supabase
                    .from('iers_user_roles')
                    .select('iers_roles(name)')
                    .eq('user_id', session.user.id)
                    .single();

                // @ts-ignore
                const dbRole = roleData?.iers_roles?.name || 'NO_ROLE';

                switch (dbRole) {
                    case 'ADMIN':
                    case 'SUPER_ADMIN':
                        navigate('/admission/admin/overview');
                        break;
                    case 'DRC':
                        navigate('/admission/overview');
                        break;
                    case 'APPLICANT':
                        navigate('/admission/dashboard');
                        break;
                    case 'FACULTY':
                    case 'GUIDE':
                        navigate('/admission/guide/verification');
                        break;
                    default:
                        // Optional: Navigate to a pending page or applicant default if desired, but strict requirement says NO FALLBACK to applicant unless DB says so.
                        // We will navigate to status as a safe landing or dashboard if they have no role yet (e.g. self-registered applicant might get role via trigger? Trigger logic handles profile, maybe role too?)
                        // If no role, maybe applicant dashboard is safer?
                        // The prompt says: "default: navigate('/access-pending')"
                        navigate('/access-pending');
                }
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-3xl animate-pulse delay-1000"></div>

            {/* Back to Home Link */}
            <div className="absolute top-8 left-8 hidden lg:block">
                <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Website
                </Link>
            </div>

            {/* Login Card Container with Load Animation */}
            <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                {/* Branding above card */}
                <div className="flex flex-col items-center mb-8 text-center space-y-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-4">EduPlatform</h1>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">PhD Admission Portal</p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl text-center">Sign in</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@university.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-primary hover:underline underline-offset-4"
                                            onClick={() => {/* Would point to forgot password flow if implemented */ }}
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-11 pr-10 transition-all focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md animate-in fade-in zoom-in-95">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-semibold transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <div className="text-center mt-6">
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link to="/apply" className="font-medium text-primary hover:underline underline-offset-4">
                                        Apply now
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer copyright */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    &copy; {new Date().getFullYear()} Institution Admission Cell. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
