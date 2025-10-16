import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Mic, Users, BarChart, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@assets/generated_images/Speech_therapy_hero_image_ecef702d.png';
import Mascot from '@/components/Mascot';

export default function Home() {
  const features = [
    {
      icon: Mic,
      title: 'Voice Recording',
      description: 'Easy-to-use recording interface with guided practice sessions',
    },
    {
      icon: BarChart,
      title: 'AI Analysis',
      description: 'Advanced speech analysis powered by OpenAI Whisper technology',
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Separate portals for patients and therapists with tailored features',
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'Automated PDF reports with detailed analysis and recommendations',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SpeechEase</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              AI-Powered Speech Therapy Platform
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Helping patients improve their speech with intelligent analysis, gamified feedback, and professional reports. Make speech therapy engaging and effective.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg h-12 px-8" data-testid="button-start-session">
                  Start Your First Session
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg h-12 px-8" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img src={heroImage} alt="Speech therapy session" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose SpeechEase?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed by speech therapy experts and powered by cutting-edge AI technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-elevate">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Mascot size="large" message="Ready to start your speech therapy journey? Let's make it fun and effective!" />
          <div className="mt-12">
            <Link href="/register">
              <Button size="lg" className="text-lg h-12 px-12" data-testid="button-cta-register">
                Create Your Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2025 SpeechEase. AI-powered speech therapy platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
