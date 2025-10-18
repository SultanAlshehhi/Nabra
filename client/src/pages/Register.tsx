import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Mic, ArrowLeft, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Mascot from '@/components/Mascot';
import nabraLogo from '@assets/attached_assets/Nabra.png';

export default function Register() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<'patient' | 'therapist'>('patient');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
  });

  const handleRoleSubmit = () => {
    setStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration submitted:', { role, ...formData });
    if (role === 'patient') {
      setLocation('/dashboard/patient');
    } else {
      setLocation('/dashboard/therapist');
    }
  };

  if (step === 'role') {
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
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center">
              <Mascot size="medium" message="Let's get you started! First, tell me who you are." />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">Choose your role</CardTitle>
                  <CardDescription>Select how you'll be using Nabra</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={role} onValueChange={(value) => setRole(value as 'patient' | 'therapist')}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label
                        htmlFor="patient"
                        className={`cursor-pointer hover-elevate rounded-lg border-2 transition-colors ${
                          role === 'patient' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="p-6 space-y-3">
                          <RadioGroupItem value="patient" id="patient" className="sr-only" />
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">Patient</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              I'm here to practice and improve my speech
                            </p>
                          </div>
                        </div>
                      </label>

                      <label
                        htmlFor="therapist"
                        className={`cursor-pointer hover-elevate rounded-lg border-2 transition-colors ${
                          role === 'therapist' ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="p-6 space-y-3">
                          <RadioGroupItem value="therapist" id="therapist" className="sr-only" />
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">Therapist</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              I'm a professional managing patient progress
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  <Button onClick={handleRoleSubmit} className="w-full" size="lg" data-testid="button-continue">
                    Continue
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link href="/login">
                        <a className="text-primary font-medium hover:underline" data-testid="link-login">
                          Login here
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep('role')} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <img src={nabraLogo} alt="Nabra Logo" className="w-8 h-8" />
            <span className="text-lg font-bold text-foreground">Nabra</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                <CardDescription>Fill in your details to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Abdulla A."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      data-testid="input-name"
                      required
                    />
                  </div>
                  {role === 'patient' && (
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="7"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        data-testid="input-age"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      data-testid="input-password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" data-testid="button-submit-register">
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
