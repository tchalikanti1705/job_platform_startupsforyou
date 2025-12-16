import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useAuthStore, useApplicationStore } from '../store';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Sparkles, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { recommendedJobs, getRecommendedJobs, isLoading, sortBy, setSortBy } = useJobStore();
  const { createApplication, applications, getApplications } = useApplicationStore();
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    getRecommendedJobs(sortBy);
    getApplications();
  }, [sortBy, getRecommendedJobs, getApplications]);

  useEffect(() => {
    // Track applied jobs
    const applied = new Set(applications.map(app => app.job_id));
    setAppliedJobs(applied);
  }, [applications]);

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleApply = async (jobId) => {
    const result = await createApplication(jobId);
    if (result.success) {
      toast.success('Application submitted!', {
        description: 'Good luck with your application!'
      });
      setAppliedJobs(prev => new Set([...prev, jobId]));
    } else {
      toast.error('Failed to apply', {
        description: result.error
      });
    }
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto" data-testid="home-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-slate-600 mt-1">
              Here are jobs matched to your profile
            </p>
          </div>
          
          <Tabs value={sortBy} onValueChange={handleSortChange}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="best_match" className="data-[state=active]:bg-white" data-testid="sort-best-match">
                <Sparkles className="w-4 h-4 mr-2" />
                Best Match
              </TabsTrigger>
              <TabsTrigger value="newest" className="data-[state=active]:bg-white" data-testid="sort-newest">
                <Clock className="w-4 h-4 mr-2" />
                Newest
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-100">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recommendedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No recommendations yet</h3>
            <p className="text-slate-600 mb-4">Complete your profile to get personalized job matches</p>
            <Button onClick={() => navigate('/onboarding')} className="rounded-full">
              Update Profile
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 stagger-children">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                showMatchScore
                isApplied={appliedJobs.has(job.job_id)}
                onApply={() => handleApply(job.job_id)}
                onViewDetails={() => handleViewDetails(job.job_id)}
              />
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {!isLoading && recommendedJobs.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => getRecommendedJobs(sortBy)}
              className="rounded-full"
              data-testid="refresh-jobs-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Jobs
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
