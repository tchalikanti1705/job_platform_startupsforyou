import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Briefcase, Target, BarChart3, MapPin, ArrowRight, Search, Sparkles, TrendingUp, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  
  // Rotating text animation
  const rotatingTexts = [
    { text: 'Finding Your Dream Job', icon: <Search className="w-8 h-8" /> },
    { text: 'Matching Your Skills', icon: <Target className="w-8 h-8" /> },
    { text: 'Tracking Applications', icon: <TrendingUp className="w-8 h-8" /> },
    { text: 'Discovering Startups', icon: <Sparkles className="w-8 h-8" /> },
    { text: 'Analyzing Insights', icon: <BarChart3 className="w-8 h-8" /> },
    { text: 'Accelerating Success', icon: <Zap className="w-8 h-8" /> },
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
      icon: <Target className="w-6 h-6" />,
      title: 'Smart Matching',
      description: 'Get personalized job recommendations based on your skills and preferences.'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Application Tracker',
      description: 'Keep track of all your applications in one place with status updates.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Insights Dashboard',
      description: 'Visualize your job search progress with detailed analytics.'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Startup Focus',
      description: 'Discover exciting opportunities at innovative startups.'
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
            {/* Animated Text Display - Now Centered */}
            <div className="relative w-full max-w-lg mb-12">
              {/* Animated background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-blue-100 rounded-full animate-pulse opacity-60"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-blue-200 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-blue-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '1s' }}></div>
              </div>
              
              {/* Main animated content */}
              <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-slate-200">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Animated icon */}
                  <div 
                    className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 ${isAnimating ? 'scale-90 opacity-50 rotate-12' : 'scale-100 opacity-100 rotate-0'}`}
                  >
                    {rotatingTexts[currentIndex].icon}
                  </div>
                  
                  {/* Animated text */}
                  <div className="h-20 flex items-center justify-center">
                    <p 
                      className={`text-3xl lg:text-4xl font-bold text-slate-800 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                    >
                      {rotatingTexts[currentIndex].text}
                    </p>
                  </div>
                  
                  {/* Progress dots */}
                  <div className="flex gap-2">
                    {rotatingTexts.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex 
                            ? 'bg-blue-500 w-8' 
                            : 'bg-slate-300 w-2'
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Powered by AI matching</span>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 right-8 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
                100+ Jobs
              </div>
              <div className="absolute -bottom-4 left-8 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                Smart Insights
              </div>
              <div className="absolute top-1/2 -right-8 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
                Real-time
              </div>
            </div>
            
            {/* Main Heading */}
            <div className="animate-fade-in mb-8">
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
                Find Your Dream Job,{' '}
                <span className="text-primary bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Faster</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Upload your resume, get matched with the best opportunities, and track your applications all in one place. Built for students and job seekers.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful tools to streamline your job search and help you land your next opportunity.
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
            Ready to Start Your Job Search?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of job seekers who have found their dream jobs using RolesForU.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="rounded-full px-10"
            data-testid="cta-signup-btn"
          >
            Create Free Account
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
