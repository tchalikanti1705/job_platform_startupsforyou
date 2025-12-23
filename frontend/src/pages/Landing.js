import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Briefcase, Target, BarChart3, Rocket, ArrowRight, Users, Sparkles, TrendingUp, Zap, Building2, Trophy, ChevronRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Direct Founder Access',
      description: 'Connect directly with startup founders and hiring managers. No recruiters, no middlemen.'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Seed to Unicorn',
      description: 'Discover opportunities from early-stage startups to billion-dollar unicorns.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Startup Insights',
      description: 'Get funding data, team size, and growth metrics for every startup.'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Equity & Impact',
      description: 'Find roles with real equity and the chance to shape company culture.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Startup Jobs' },
    { value: '200+', label: 'Companies' },
    { value: '50K+', label: 'Professionals' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">StartupsForYou</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-foreground font-normal"
              data-testid="login-btn"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="bg-primary hover:bg-primary/90 font-medium px-6"
              data-testid="signup-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-accent font-medium tracking-wide uppercase text-sm mb-6">
            The Premier Startup Jobs Platform
          </p>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8 tracking-tight">
            Where Ambitious Talent Meets{' '}
            <span className="text-primary">Exceptional Startups</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect directly with founders at the world's most promising startups. 
            From seed-stage ventures to unicorns, find your next opportunity.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-primary hover:bg-primary/90 px-8 py-6 text-base font-medium"
              data-testid="get-started-btn"
            >
              Start Your Search
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-border text-foreground hover:bg-secondary px-8 py-6 text-base font-normal"
            >
              I Have an Account
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 pt-8 border-t border-border">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-wide uppercase text-sm mb-4">
              Why StartupsForYou
            </p>
            <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
              Built for the Startup Ecosystem
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to find your perfect role at a startup that matches your ambition.
            </p>
          </div>
          
          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-background p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isVisible ? 'animate-slide-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center text-accent mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
            Ready to Find Your Next Role?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of professionals building the future at world-changing startups.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-primary hover:bg-primary/90 px-8 font-medium"
            data-testid="cta-signup-btn"
          >
            Get Started — It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">StartupsForYou</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 StartupsForYou. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
