import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Clock, 
  Mail,
  Database,
  Globe,
  Monitor,
  Save
} from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { useCurrentUser } from "@/hooks/useUsers";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendOtp, verifyOtp } from "@/services/otp";

export default function Settings() {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const updateSettingsMutation = useUpdateSettings({ silent: true });
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState({
    first_name: currentUser?.first_name || "",
    last_name: currentUser?.last_name || "",
    phone: currentUser?.phone || "",
  });

  // Local theme state for immediate UI feedback
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = (localStorage.getItem("theme") as 'light' | 'dark' | 'system' | null);
    return settings?.theme || saved || 'system';
  });

  // Keep local selectedTheme in sync when settings load/change
  useEffect(() => {
    if (settings?.theme) {
      setSelectedTheme(settings.theme);
    }
  }, [settings?.theme]);

  const prefersDark = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  const applyThemeToDOM = (mode: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    const effective = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;
    if (effective === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    // Immediate local update for responsiveness
    setSelectedTheme(theme);
    localStorage.setItem('theme', theme);
    applyThemeToDOM(theme);

    // Persist in backend settings (best-effort)
    try {
      await updateSettingsMutation.mutateAsync({ theme });
    } catch (e) {
      // No-op: UI already updated locally; persistence can be retried later
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically update the user profile via a separate hook
    console.log("Profile update:", profileData);
  };

  // 2FA (email OTP) state and handlers
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<'idle' | 'sending' | 'verifying'>('idle');
  const [pendingEnable, setPendingEnable] = useState<boolean | null>(null); // null=no action, true=enable, false=disable

  const handleTwoFAToggle = async (next: boolean) => {
    // If enabling, open OTP dialog and send code first; only persist after verify
    if (next) {
      setPendingEnable(true);
      setTwoFAOpen(true);
      setOtpCode("");
      try {
        setOtpStep('sending');
        if (user?.email) await sendOtp(user.email);
      } finally {
        setOtpStep('idle');
      }
    } else {
      // Disable immediately
      setPendingEnable(false);
      await updateSettingsMutation.mutateAsync({ two_factor_enabled: false });
    }
  };

  const handleVerifyOTP = async () => {
    if (!user?.email || !otpCode) return;
    try {
      setOtpStep('verifying');
      const res = await verifyOtp(user.email, otpCode);
      if (res?.success) {
        await updateSettingsMutation.mutateAsync({ two_factor_enabled: true });
        setTwoFAOpen(false);
        setPendingEnable(null);
        setOtpCode("");
      }
    } finally {
      setOtpStep('idle');
    }
  };

  if (settingsLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and system configuration
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>Manage your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Role</Label>
                  <Badge className="bg-primary/20 text-primary">
                    {currentUser?.role || 'User'}
                  </Badge>
                </div>

                <Button type="submit" className="bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <NotificationSettings />

          {/* Appearance Settings */}
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={selectedTheme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('light')}
                  >
                    Light
                  </Button>
                  <Button 
                    variant={selectedTheme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('dark')}
                  >
                    Dark
                  </Button>
                  <Button 
                    variant={selectedTheme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleThemeChange('system')}
                  >
                    System
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Interface language
                  </p>
                </div>
                <Badge variant="outline">English (US)</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Privacy & Security</CardTitle>
              </div>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add extra security to your account
                  </p>
                </div>
                <Switch
                  checked={Boolean(settings?.two_factor_enabled)}
                  onCheckedChange={handleTwoFAToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your profile
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2FA OTP Dialog */}
          <Dialog open={twoFAOpen} onOpenChange={(o) => { setTwoFAOpen(o); if (!o) { setPendingEnable(null); setOtpCode(''); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  We sent a 6-digit verification code to your email {user?.email}. Enter it below to enable 2FA.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => { if (user?.email) { setOtpStep('sending'); try { await sendOtp(user.email); } finally { setOtpStep('idle'); } } }}
                    disabled={otpStep !== 'idle'}
                  >
                    Resend Code
                  </Button>
                  <Button onClick={handleVerifyOTP} disabled={!otpCode || otpStep !== 'idle'}>
                    {otpStep === 'verifying' ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                </div>
              </div>
              <DialogFooter />
            </DialogContent>
          </Dialog>
        </div>

        {/* System Information */}
        <div className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-primary" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Version</span>
                </div>
                <span className="text-sm font-medium">v2.1.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">API Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-sm font-medium">Operational</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Backup Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                System Logs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Test Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}