import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Rocket, CheckCircle, Mail } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground font-accent">StartupsForYou</span>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardContent className="pt-8 pb-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-accent/30">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-3">
              Thanks for Registering! 🎉
            </h1>
            
            <p className="text-muted-foreground mb-6">
              We're building something amazing for startup job seekers.
            </p>

            <div className="bg-primary/5 rounded-lg p-4 mb-6 border border-primary/20">
              <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-2">
                <Rocket className="w-5 h-5" />
                Coming Soon
              </div>
              <p className="text-sm text-muted-foreground">
                We'll notify you when we launch. Get ready to discover amazing startup opportunities!
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-left text-sm text-muted-foreground">
                <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 border border-accent/30">
                  <span className="text-accent text-xs font-bold">1</span>
                </div>
                <span>🚀 Explore the Startup Jobs</span>
              </div>
              <div className="flex items-center gap-3 text-left text-sm text-muted-foreground">
                <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 border border-accent/30">
                  <span className="text-accent text-xs font-bold">2</span>
                </div>
                <span>💬 Connect with the Founders and Message Them</span>
              </div>
              <div className="flex items-center gap-3 text-left text-sm text-muted-foreground">
                <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 border border-accent/30">
                  <span className="text-accent text-xs font-bold">3</span>
                </div>
                <span>📊 Tracker and Insights</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <Link to="/">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
};

export default ComingSoon;
