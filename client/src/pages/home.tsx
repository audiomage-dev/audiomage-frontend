import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import audiomageLogoPath from '@assets/audiomage-logo-transparent.png';
import { Play, Mic, Activity, Sparkles, Users, FileAudio } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={audiomageLogoPath}
                alt="Audiomage Logo"
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Audiomage
              </h1>
            </div>
            <Link href="/studio">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Launch Studio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-[var(--foreground)] mb-6">
            Professional AI Audio Workstation
          </h2>
          <p className="text-xl text-[var(--muted-foreground)] mb-8 max-w-2xl mx-auto">
            Create, edit, and master audio with cutting-edge AI assistance. The
            future of music production is here.
          </p>
          <Link href="/studio">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Creating
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-[var(--foreground)] mb-12">
          Powerful Features
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <Sparkles className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-[var(--card-foreground)]">
                AI-Powered Production
              </CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">
                Advanced AI tools for mixing, mastering, and creative
                enhancement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <Activity className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-[var(--card-foreground)]">
                Multi-Track Editor
              </CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">
                Professional timeline and MIDI editing with real-time
                visualization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <Mic className="h-8 w-8 text-red-500 mb-2" />
              <CardTitle className="text-[var(--card-foreground)]">
                Recording Suite
              </CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">
                High-quality recording with intelligent noise reduction
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <Users className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-[var(--card-foreground)]">
                Collaboration
              </CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">
                Real-time collaborative editing with session management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <FileAudio className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle className="text-[var(--card-foreground)]">
                Format Support
              </CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">
                Support for all major audio formats and professional standards
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <Play className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-[var(--card-foreground)]">
                Real-time Processing
              </CardTitle>
              <CardDescription className="text-[var(--muted-foreground)]">
                Zero-latency monitoring and real-time effects processing
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-[var(--foreground)] mb-6">
            Ready to Create?
          </h3>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Join thousands of creators using Audiomage to produce
            professional-quality audio.
          </p>
          <Link href="/studio">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Launch Studio
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--muted)]/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center space-x-3">
            <img
              src={audiomageLogoPath}
              alt="Audiomage Logo"
              className="w-6 h-6 object-contain"
            />
            <span className="text-[var(--muted-foreground)]">
              © 2024 Audiomage. Professional AI Audio Workstation.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
