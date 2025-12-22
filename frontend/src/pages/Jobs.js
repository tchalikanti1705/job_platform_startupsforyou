import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useApplicationStore } from '../store';
import Layout from '../components/Layout';
import JobCard from '../components/JobCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { Search, X, SlidersHorizontal, Briefcase, Rocket, TrendingUp, Building2, Crown } from 'lucide-react';
import { toast } from 'sonner';

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 
  'SQL', 'AWS', 'Docker', 'Machine Learning', 'Git'
];

const FUNDING_STAGES = [
  { value: 'Seed', label: 'Seed', icon: '🌱', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'Series A', label: 'Series A', icon: '📈', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Series B', label: 'Series B', icon: '🚀', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'Series C', label: 'Series C', icon: '💰', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'Unicorn', label: 'Unicorn', icon: '🦄', color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

const USA_CITIES = [
  { value: '', label: 'All Locations' },
  { value: 'San Francisco', label: '🌉 San Francisco' },
  { value: 'New York', label: '🗽 New York' },
  { value: 'Seattle', label: '🌲 Seattle' },
  { value: 'Austin', label: '🤠 Austin' },
  { value: 'Boston', label: '🎓 Boston' },
  { value: 'Los Angeles', label: '🌴 Los Angeles' },
  { value: 'Remote', label: '🏠 Remote' },
];

const Jobs = () => {
  const navigate = useNavigate();
  const { jobs, searchJobs, isLoading, filters, setFilters } = useJobStore();
  const { createApplication, applications, getApplications } = useApplicationStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [selectedFunding, setSelectedFunding] = useState([]);

  useEffect(() => {
    searchJobs();
    getApplications();
  }, [searchJobs, getApplications]);

  useEffect(() => {
    const applied = new Set(applications.map(app => app.job_id));
    setAppliedJobs(applied);
  }, [applications]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ query: searchQuery });
    searchJobs();
  };

  const handleSkillToggle = (skill) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    setFilters({ skills: newSkills });
  };

  const handleFundingToggle = (stage) => {
    const newStages = selectedFunding.includes(stage)
      ? selectedFunding.filter(s => s !== stage)
      : [...selectedFunding, stage];
    setSelectedFunding(newStages);
    setFilters({ funding_stage: newStages.join(',') });
  };

  const handleApply = async (jobId) => {
    const result = await createApplication(jobId);
    if (result.success) {
      toast.success('Application submitted!');
      setAppliedJobs(prev => new Set([...prev, jobId]));
    } else {
      toast.error('Failed to apply', { description: result.error });
    }
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFunding([]);
    setFilters({
      query: '',
      skills: [],
      experience_level: '',
      location: '',
      funding_stage: '',
      remote: null
    });
    searchJobs();
  };

  const applyFilters = () => {
    searchJobs();
    setShowFilters(false);
  };

  const hasActiveFilters = 
    filters.query || 
    filters.skills.length > 0 || 
    filters.experience_level || 
    filters.location ||
    selectedFunding.length > 0 ||
    filters.remote !== null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto" data-testid="jobs-page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🚀 Startup Jobs
          </h1>
          <p className="text-slate-600">Find your next opportunity at top USA startups</p>
        </div>

        {/* Funding Stage Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FUNDING_STAGES.map((stage) => (
            <button
              key={stage.value}
              onClick={() => handleFundingToggle(stage.value)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                selectedFunding.includes(stage.value)
                  ? stage.color + ' ring-2 ring-offset-1'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
              data-testid={`funding-filter-${stage.value.toLowerCase().replace(' ', '-')}`}
            >
              <span className="mr-1.5">{stage.icon}</span>
              {stage.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies, or keywords..."
              className="pl-10 h-12"
              data-testid="job-search-input"
            />
          </div>
          <Button type="submit" className="h-12 px-6 rounded-full" data-testid="search-btn">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 px-4"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="toggle-filters-btn"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </form>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-slate-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters-btn">
                    Clear all
                  </Button>
                )}
              </div>

              {/* Skills */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-700 mb-3 block">Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={filters.skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors"
                      onClick={() => handleSkillToggle(skill)}
                      data-testid={`skill-filter-${skill.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-700 mb-3 block">Experience Level</Label>
                <Select
                  value={filters.experience_level}
                  onValueChange={(value) => setFilters({ experience_level: value })}
                >
                  <SelectTrigger data-testid="experience-filter">
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any level</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location - USA Cities */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-slate-700 mb-3 block">City</Label>
                <Select
                  value={filters.location}
                  onValueChange={(value) => setFilters({ location: value })}
                >
                  <SelectTrigger data-testid="location-filter">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {USA_CITIES.map((city) => (
                      <SelectItem key={city.value} value={city.value || "all"}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="remote"
                    checked={filters.remote === true}
                    onCheckedChange={(checked) => setFilters({ remote: checked ? true : null })}
                    data-testid="remote-filter"
                  />
                  <Label htmlFor="remote" className="text-sm cursor-pointer">Remote only</Label>
                </div>
              </div>

              <Button onClick={applyFilters} className="w-full mt-6 rounded-full" data-testid="apply-filters-btn">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-9">
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.query && (
                  <Badge variant="secondary" className="pl-3 pr-1 py-1">
                    "{filters.query}"
                    <button onClick={() => { setSearchQuery(''); setFilters({ query: '' }); }}>
                      <X className="w-3 h-3 ml-2" />
                    </button>
                  </Badge>
                )}
                {filters.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1">
                    {skill}
                    <button onClick={() => handleSkillToggle(skill)}>
                      <X className="w-3 h-3 ml-2" />
                    </button>
                  </Badge>
                ))}
                {filters.experience_level && (
                  <Badge variant="secondary" className="pl-3 pr-1 py-1">
                    {filters.experience_level} level
                    <button onClick={() => setFilters({ experience_level: '' })}>
                      <X className="w-3 h-3 ml-2" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Job List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-slate-100">
                    <div className="flex gap-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-600 mb-4">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters} className="rounded-full">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-4">{jobs.length} jobs found</p>
                {jobs.map((job) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    isApplied={appliedJobs.has(job.job_id)}
                    onApply={() => handleApply(job.job_id)}
                    onViewDetails={() => handleViewDetails(job.job_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
