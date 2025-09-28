import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendOtp, verifyOtp } from '@/services/otp';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // OTP (2FA) state
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'idle' | 'sending' | 'verifying'>('idle');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const resolveLandingPath = (role?: string) => {
    const r = (role || '').toLowerCase();
    if (from && from !== '/auth') return from; // preserve deep-link when present
    if (r === 'admin') return '/users';
    if (r === 'instructor') return '/courses';
    if (r === 'student') return '/timetable';
    return '/';
  };

  // Ensure a profile exists for the authenticated user; if not, create as student by default
  const ensureStudentProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;
    const { data: existing } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', authUser.id)
      .maybeSingle();
    if (existing?.id) return existing;
    const first_name = (authUser.user_metadata?.first_name as string) || '';
    const last_name = (authUser.user_metadata?.last_name as string) || '';
    const { data: created } = await supabase
      .from('profiles')
      .insert({ user_id: authUser.id, first_name, last_name, role: 'student' })
      .select('id, role')
      .single();
    return created;
  };
  
  // If already authenticated, decide whether to redirect or require OTP
  // We use an effect to avoid immediate navigation loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  (function handleExistingSession() {
    if (!user) return;
    // Check if OTP already verified in this device/session
    const verified = (() => { try { return localStorage.getItem('otp_verified') === 'true'; } catch { return false; } })();
    if (verified) {
      (async () => {
        try {
          const profile = await ensureStudentProfile();
          navigate(resolveLandingPath(profile?.role), { replace: true });
        } catch {
          navigate('/', { replace: true });
        }
      })();
      return;
    }
    // Otherwise, check if 2FA is enabled and start OTP flow if needed
    (async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle();
        if (!profile) { await ensureStudentProfile(); }
        const { data: settings } = await supabase
          .from('settings')
          .select('two_factor_enabled')
          .eq('user_id', profile.id)
          .single();
        if (settings?.two_factor_enabled) {
          setOtpRequired(true);
          setOtpCode('');
          setOtpStep('sending');
          try { await sendOtp(authUser.email!); } finally { setOtpStep('idle'); }
        } else {
          const created = await ensureStudentProfile();
          navigate(resolveLandingPath(created?.role), { replace: true });
        }
      } catch {
        navigate('/', { replace: true });
      }
    })();
  })();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // New login attempt: reset OTP verified flag
    try { localStorage.removeItem('otp_verified'); } catch {}

    const { error } = await signIn(formData.email, formData.password);

    if (!error) {
      // Check if user has 2FA enabled
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get profile id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('user_id', user.id)
            .maybeSingle();
          if (!profile) {
            await ensureStudentProfile();
          }
          if (profile) {
            const { data: settings } = await supabase
              .from('settings')
              .select('two_factor_enabled')
              .eq('user_id', profile.id)
              .single();
            if (settings?.two_factor_enabled) {
              // initiate OTP flow
              setOtpRequired(true);
              setOtpCode('');
              setOtpStep('sending');
              try {
                await sendOtp(formData.email);
              } finally {
                setOtpStep('idle');
              }
              setIsLoading(false);
              return; // do not navigate yet
            }
          }
        }
        // No 2FA enforced -> redirect by role
        const created = await ensureStudentProfile();
        navigate(resolveLandingPath(created?.role), { replace: true });
      } catch {
        // Fallback: go to home
        navigate('/', { replace: true });
      }
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(
      formData.email, 
      formData.password, 
      formData.firstName, 
      formData.lastName
    );
    
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-subtle p-4 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-gradient-primary opacity-25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-20 h-96 w-96 rounded-full bg-gradient-primary opacity-20 blur-3xl" />

      <Card className="w-full max-w-md shadow-elegant border border-border/60 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-primary">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to EduManage</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-secondary/60 dark:bg-secondary/40 p-1">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              {!otpRequired ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary shadow-elegant"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp-code">Verification Code</Label>
                    <div className="relative">
                      <Input
                        id="otp-code"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter 6-digit code sent to your email"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={async () => { setOtpStep('sending'); try { await sendOtp(formData.email); } finally { setOtpStep('idle'); } }}
                      disabled={otpStep !== 'idle'}
                    >
                      Resend Code
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!otpCode) return;
                        setOtpStep('verifying');
                        try {
                          const res = await verifyOtp(formData.email, otpCode);
                          if (res?.success) {
                            try { localStorage.setItem('otp_verified', 'true'); } catch {}
                            // After OTP, redirect by role
                            try {
                              const created = await ensureStudentProfile();
                              navigate(resolveLandingPath(created?.role), { replace: true });
                            } catch {
                              navigate('/', { replace: true });
                            }
                          }
                        } finally {
                          setOtpStep('idle');
                        }
                      }}
                      disabled={!otpCode || otpStep !== 'idle'}
                    >
                      {otpStep === 'verifying' ? 'Verifying...' : 'Verify & Continue'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary shadow-elegant"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Student Account"}
                </Button>
                {/* Admin quick login (hidden if env not set) */}
                {import.meta.env.VITE_ADMIN_EMAIL && import.meta.env.VITE_ADMIN_PASSWORD && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await signIn(import.meta.env.VITE_ADMIN_EMAIL as string, import.meta.env.VITE_ADMIN_PASSWORD as string);
                        const created = await ensureStudentProfile(); // ensure profile exists (role will still be enforced by DB/policies)
                        navigate(resolveLandingPath(created?.role), { replace: true });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Login as Admin
                  </Button>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}