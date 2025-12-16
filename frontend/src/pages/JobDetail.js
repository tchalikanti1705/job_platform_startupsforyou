import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobStore, useApplicationStore } from '../store';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Building2, 
  ExternalLink, Briefcase, Users, DollarSign, Check 
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { currentJob, getJob, isLoading, clearCurrentJob } = useJobStore();
  const { createApplication, applications, getApplications } = useApplicationStore();
  
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (jobId) {
      getJob(jobId);
      getApplications();
    }
    return () => clearCurrentJob();
  }, [jobId, getJob, getApplications, clearCurrentJob]);

  useEffect(() => {
    const applied = applications.some(app => app.job_id === jobId);
    setIsApplied(applied);
  }, [applications, jobId]);

  const handleApply = async () => {
    setIsApplying(true);
    const result = await createApplication(jobId);
    setIsApplying(false);
    
    if (result.success) {
      toast.success('Application submitted!', {
        description: 'Track your application in the Tracker'
      });
      setIsApplied(true);
    } else {
      toast.error('Failed to apply', { description: result.error });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="bg-white rounded-xl p-8 border border-slate-100">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-5 w-1/2 mb-6" />
            <div className="flex gap-2 mb-6">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentJob) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Job not found</h2>
          <Button onClick={() => navigate('/jobs')} className="rounded-full">
            Browse Jobs
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto" data-testid="job-detail-page">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Main Card */}
        <Card className="border-slate-100 mb-6">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2" data-testid="job-title">
                  {currentJob.title}
                </h1>
                <div className="flex items-center gap-2 text-slate-600 mb-4">
                  <Building2 className="w-5 h-5" />
                  <span className="text-lg">{currentJob.company}</span>
                  {currentJob.is_startup && (
                    <Badge variant="secondary" className="ml-2">Startup</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {currentJob.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {currentJob.job_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {currentJob.experience_level} level
                  </span>
                  {currentJob.remote && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Remote
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {isApplied ? (
                  <Button disabled className="rounded-full px-8" data-testid="applied-btn">
                    <Check className="w-4 h-4 mr-2" />
                    Applied
                  </Button>
                ) : (
                  <Button 
                    onClick={handleApply} 
                    disabled={isApplying}
                    className="rounded-full px-8"
                    data-testid="apply-btn"
                  >
                    {isApplying ? 'Applying...' : 'Apply Now'}
                  </Button>
                )}
                
                {currentJob.apply_url && (
                  <Button 
                    variant="outline" 
                    className="rounded-full"
                    onClick={() => window.open(currentJob.apply_url, '_blank')}
                    data-testid="external-apply-btn"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Company Site
                  </Button>
                )}
              </div>
            </div>

            {/* Key Info */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Posted
                </div>
                <p className="font-semibold text-slate-900">
                  {formatDate(currentJob.date_posted)}
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Deadline
                </div>
                <p className="font-semibold text-slate-900">
                  {formatDate(currentJob.application_deadline)}
                </p>
              </div>
              
              {currentJob.salary_range && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    Salary
                  </div>
                  <p className="font-semibold text-slate-900">
                    {currentJob.salary_range}
                  </p>
                </div>
              )}
            </div>

            {/* Skills */}
            {currentJob.skills_required?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-slate-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills_required.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">About this role</h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-line">
                  {currentJob.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default JobDetail;
