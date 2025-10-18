import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Mic, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Mascot from '@/components/Mascot';
import nabraLogo from '@assets/attached_assets/Nabra.png';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'therapist'>('patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login submitted:', { email, password, role });
    if (role === 'patient') {
      setLocation('/dashboard/patient');
    } else {
      setLocation('/dashboard/therapist');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={nabraLogo} alt="Nabra Logo" className="w-8 h-8" />
            <span className="text-lg font-bold text-foreground">Nabra</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Mascot size="medium" message="Welcome back! Let's continue your progress." />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Login to your account</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Login as</Label>
                    <RadioGroup value={role} onValueChange={(value) => setRole(value as 'patient' | 'therapist')} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="patient" id="role-patient" />
                        <Label htmlFor="role-patient" className="font-normal cursor-pointer">Patient</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="therapist" id="role-therapist" />
                        <Label htmlFor="role-therapist" className="font-normal cursor-pointer">Therapist</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full" size="lg" data-testid="button-submit-login">
                    Login
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/register">
                      <a className="text-primary font-medium hover:underline" data-testid="link-register">
                        Register here
                      </a>
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
