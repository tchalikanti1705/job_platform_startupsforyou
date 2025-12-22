import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { 
  MapPin, Calendar, Clock, Building2, Sparkles, 
  Check, ExternalLink, Briefcase 
} from 'lucide-react';
import { format } from 'date-fns';

// Funding stage styling
const FUNDING_STYLES = {
  'Seed': { emoji: '🌱', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Series A': { emoji: '📈', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Series B': { emoji: '🚀', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Series C': { emoji: '💰', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Series D': { emoji: '💎', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Series D+': { emoji: '💎', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Unicorn': { emoji: '🦄', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
};

const JobCard = ({ 
  job, 
  showMatchScore = false,
  isApplied = false, 
  onApply, 
  onViewDetails 
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'MMM d');
    } catch {
      return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-slate-600 bg-slate-50';
  };

  const fundingStyle = FUNDING_STYLES[job.funding_stage] || FUNDING_STYLES['Series A'];

  return (
    <Card 
      className="border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
      onClick={onViewDetails}
      data-testid={`job-card-${job.job_id}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Company Logo / Icon */}
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company} className="w-8 h-8 rounded" />
            ) : (
              <Building2 className="w-6 h-6 text-primary" />
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-600">{job.company}</span>
                  {job.funding_stage && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${fundingStyle.bg} ${fundingStyle.text} ${fundingStyle.border}`}
                    >
                      <span className="mr-1">{fundingStyle.emoji}</span>
                      {job.funding_stage}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Match Score */}
              {showMatchScore && job.match_score > 0 && (
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${getScoreColor(job.match_score)}`}>
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">{Math.round(job.match_score)}%</span>
                </div>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.experience_level} level
              </span>
              {job.date_posted && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted {formatDate(job.date_posted)}
                </span>
              )}
              {job.application_deadline && (
                <span className="flex items-center gap-1 text-orange-600">
                  <Clock className="w-4 h-4" />
                  Due {formatDate(job.application_deadline)}
                </span>
              )}
              {job.remote && (
                <Badge variant="secondary" className="text-green-600 bg-green-50">
                  Remote
                </Badge>
              )}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills_required?.slice(0, 5).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className={
                    showMatchScore && job.matched_skills?.includes(skill)
                      ? 'bg-green-50 text-green-700'
                      : ''
                  }
                >
                  {skill}
                </Badge>
              ))}
              {job.skills_required?.length > 5 && (
                <Badge variant="outline">+{job.skills_required.length - 5}</Badge>
              )}
            </div>

            {/* Match Info */}
            {showMatchScore && job.match_score > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-500">Profile match</span>
                  <span className="font-medium text-slate-700">{Math.round(job.match_score)}%</span>
                </div>
                <Progress value={job.match_score} className="h-2" />
                {job.why_recommended && (
                  <p className="text-xs text-slate-500 mt-2 italic">
                    {job.why_recommended}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isApplied ? (
                <Button disabled className="rounded-full" size="sm" data-testid={`applied-${job.job_id}`}>
                  <Check className="w-4 h-4 mr-1" />
                  Applied
                </Button>
              ) : (
                <Button 
                  onClick={(e) => { e.stopPropagation(); onApply?.(); }}
                  className="rounded-full"
                  size="sm"
                  data-testid={`apply-${job.job_id}`}
                >
                  Apply Now
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => { e.stopPropagation(); onViewDetails?.(); }}
                data-testid={`view-${job.job_id}`}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
