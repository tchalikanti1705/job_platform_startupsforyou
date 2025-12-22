import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Briefcase, Target, BarChart3, Rocket, ArrowRight, Users, Sparkles, TrendingUp, Zap, Building2, Trophy } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  
  // Rotating text animation
  const rotatingTexts = [
    { text: 'Connecting with Founders', icon: <Users className="w-8 h-8" /> },
    { text: 'Discovering Seed Startups', icon: <Sparkles className="w-8 h-8" /> },
    { text: 'Joining Series A-C Rockets', icon: <Rocket className="w-8 h-8" /> },
    { text: 'Landing Unicorn Roles', icon: <Trophy className="w-8 h-8" /> },
    { text: 'Building the Future', icon: <Building2 className="w-8 h-8" /> },
    { text: 'Accelerating Your Career', icon: <Zap className="w-8 h-8" /> },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingTexts.length);
        setIsAnimating(false);
      }, 300);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">RolesForU</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              data-testid="login-btn"
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="rounded-full px-6"
              data-testid="signup-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 min-h-[90vh] flex items-center">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col items-center text-center">
            
            {/* Main Heading with Animated Text */}
            <div className="animate-fade-in mb-8">
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-8">
                Join the Startup{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Revolution</span>
              </h1>
              
              {/* Animated Rotating Text */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div 
                  className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 ${isAnimating ? 'scale-75 opacity-50 rotate-180' : 'scale-100 opacity-100 rotate-0'}`}
                >
                  {rotatingTexts[currentIndex].icon}
                </div>
                <div className="h-12 flex items-center overflow-hidden">
                  <p 
                    className={`text-2xl lg:text-3xl font-semibold text-slate-700 transition-all duration-500 ${isAnimating ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'}`}
                  >
                    {rotatingTexts[currentIndex].text}
                  </p>
                </div>
              </div>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-8">
                {rotatingTexts.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-blue-500 w-8' 
                        : 'bg-slate-300 w-2 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
                Connect directly with founders, discover roles at the hottest startups from Seed to Unicorn, and build the future.
              </p>
              <p className="text-lg text-slate-500">
                The #1 platform for startup jobs.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="rounded-full px-10 py-6 text-lg group"
                data-testid="get-started-btn"
              >
                Start Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="rounded-full px-10 py-6 text-lg"
              >
                I have an account
              </Button>
            </div>
            
            {/* Floating badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                500+ Startup Jobs
              </div>
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Direct Founder Access
              </div>
              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Seed → Series → Unicorn
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Built for the Startup Ecosystem
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to find your perfect role at a startup that matches your ambition.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Ready to Join a Rocket Ship? 🚀
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of ambitious people building the future at world-changing startups.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="rounded-full px-10"
            data-testid="cta-signup-btn"
          >
            Start Your Startup Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">RolesForU</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 RolesForU. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
