import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Briefcase, Target, BarChart3, MapPin, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

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
            <span className="text-xl font-bold text-slate-900">JobHub</span>
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
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Find Your Dream Job,{' '}
                <span className="text-primary">Faster</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Upload your resume, get matched with the best opportunities, and track your applications all in one place. Built for students and job seekers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="rounded-full px-8 group"
                  data-testid="get-started-btn"
                >
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="rounded-full px-8"
                >
                  I have an account
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:block animate-slide-in-right">
              <img
                src="https://images.unsplash.com/photo-1565688720651-d0d042946c5c?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                alt="People collaborating"
                className="rounded-2xl shadow-2xl"
              />
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
            Join thousands of job seekers who have found their dream jobs using JobHub.
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
            <span className="font-semibold text-slate-900">JobHub</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2025 JobHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
