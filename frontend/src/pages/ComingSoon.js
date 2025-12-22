import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Rocket, CheckCircle, Mail } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">RolesForU</span>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardContent className="pt-8 pb-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Thanks for Registering! 🎉
            </h1>
            
            <p className="text-slate-600 mb-6">
              We're building something amazing for startup job seekers.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-2">
                <Rocket className="w-5 h-5" />
                Coming Soon
              </div>
              <p className="text-sm text-slate-600">
                We'll notify you when we launch. Get ready to discover amazing startup opportunities!
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left text-sm text-slate-600">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">1</span>
                </div>
                <span>🦄 Exclusive Startup Jobs (Seed to Unicorn)</span>
              </div>
              <div className="flex items-center gap-3 text-left text-sm text-slate-600">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">2</span>
                </div>
                <span>📄 AI-Powered Resume Matching</span>
              </div>
              <div className="flex items-center gap-3 text-left text-sm text-slate-600">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">3</span>
                </div>
                <span>🎯 Personalized Job Recommendations</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-sm text-slate-500">
          Questions? Contact us at{' '}
          <a href="mailto:hello@rolesforu.com" className="text-primary hover:underline">
            hello@rolesforu.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
