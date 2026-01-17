import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Briefcase, Target, BarChart3, Rocket, ArrowRight, Users, 
  Sparkles, TrendingUp, Zap, Building2, Trophy, ChevronRight,
  Code, Search, MessageSquare, CheckCircle2, ArrowRightLeft
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('engineers'); // 'engineers' or 'founders'
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

  const engineerFeatures = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Matching',
      description: 'Get matched with startups that fit your skills, experience, and career goals.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Direct Founder Access',
      description: 'Skip the recruiter queue. Connect directly with startup founders.'
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: 'Startup Insights',
      description: 'See funding stage, team size, tech stack, and growth metrics upfront.'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Equity Opportunities',
      description: 'Find roles with real equity and the chance to shape company culture.'
    }
  ];

  const founderFeatures = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Discover Top Talent',
      description: 'Browse curated profiles of engineers actively looking for startup roles.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Smart Candidate Matching',
      description: 'AI surfaces the best-fit candidates based on your role requirements.'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Direct Outreach',
      description: 'Reach out to candidates directly. No middlemen, no delays.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Application Pipeline',
      description: 'Track applications, schedule interviews, and manage your hiring funnel.'
    }
  ];

  const stats = [
    { value: '1,200+', label: 'Engineers' },
    { value: '350+', label: 'Startups' },
    { value: '800+', label: 'Open Roles' },
    { value: '95%', label: 'Response Rate' },
  ];

  const howItWorks = {
    engineers: [
      { step: '01', title: 'Create Profile', desc: 'Build your profile with skills, experience, and preferences' },
      { step: '02', title: 'Get Matched', desc: 'Our AI matches you with relevant startup opportunities' },
      { step: '03', title: 'Connect', desc: 'Apply to roles or get contacted directly by founders' },
    ],
    founders: [
      { step: '01', title: 'Post Roles', desc: 'Create your startup profile and post open positions' },
      { step: '02', title: 'Find Talent', desc: 'Browse candidates or let AI surface the best matches' },
      { step: '03', title: 'Hire', desc: 'Connect with candidates and build your team' },
    ],
  };

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
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Talent Marketplace
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-8 tracking-tight">
            Where{' '}
            <span className="text-primary">Founders</span>
            {' '}Meet{' '}
            <span className="text-accent">Engineers</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            The two-sided marketplace connecting ambitious startup founders with exceptional 
            engineering talent. Post roles, discover candidates, and build your dream team.
          </p>
          
          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/signup?role=engineer')}
              className="bg-accent hover:bg-accent/90 px-8 py-6 text-base font-medium w-full sm:w-auto"
              data-testid="engineer-signup-btn"
            >
              <Code className="w-5 h-5 mr-2" />
              I'm an Engineer
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/signup?role=founder')}
              className="bg-primary hover:bg-primary/90 px-8 py-6 text-base font-medium w-full sm:w-auto"
              data-testid="founder-signup-btn"
            >
              <Building2 className="w-5 h-5 mr-2" />
              I'm a Founder
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 md:gap-12 pt-8 border-t border-border flex-wrap">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Toggle Section */}
      <section className="py-24 px-8 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-medium tracking-wide uppercase text-sm mb-4">
              How It Works
            </p>
            <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">
              Simple Steps to Success
            </h2>
            
            {/* Toggle */}
            <div className="inline-flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('engineers')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'engineers' 
                    ? 'bg-accent text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Engineers
              </button>
              <button
                onClick={() => setActiveTab('founders')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'founders' 
                    ? 'bg-primary text-white' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Founders
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks[activeTab].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl font-bold mb-4 ${
                  activeTab === 'engineers' ? 'text-accent' : 'text-primary'
                }`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-wide uppercase text-sm mb-4">
              Platform Features
            </p>
            <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
              Built for Both Sides of the Table
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you're hiring or looking for your next role, we've got you covered.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16" ref={featuresRef}>
            {/* Engineers Column */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">For Engineers</h3>
              </div>
              <div className="space-y-6">
                {engineerFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 p-4 rounded-lg border border-border hover:border-accent/30 transition-all ${
                      isVisible ? 'animate-slide-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center text-accent flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Founders Column */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">For Founders</h3>
              </div>
              <div className="space-y-6">
                {founderFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-all ${
                      isVisible ? 'animate-slide-in' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Visual */}
      <section className="py-24 px-8 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">
            The Connection Point
          </h2>
          
          <div className="flex items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-10 h-10 text-accent" />
              </div>
              <div className="font-semibold text-foreground">Engineers</div>
              <div className="text-sm text-muted-foreground">Build amazing products</div>
            </div>
            
            <div className="flex flex-col items-center">
              <ArrowRightLeft className="w-8 h-8 text-muted-foreground mb-2" />
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">AI Matching</div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <div className="font-semibold text-foreground">Founders</div>
              <div className="text-sm text-muted-foreground">Scale their startups</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join the marketplace where startups find their perfect engineering match.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/signup?role=engineer')}
              className="bg-accent hover:bg-accent/90 px-8 font-medium"
              data-testid="cta-engineer-btn"
            >
              Find a Startup Role
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/signup?role=founder')}
              className="border-primary text-primary hover:bg-primary/10 px-8 font-medium"
              data-testid="cta-founder-btn"
            >
              Hire Engineers
            </Button>
          </div>
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
            © 2026 StartupsForYou. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

