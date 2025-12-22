import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '../store';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Building2, MapPin, Briefcase, Search, Map, List, ExternalLink, Rocket, Trophy, TrendingUp } from 'lucide-react';

// Funding stage badge colors
const fundingStageColors = {
  'Seed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Series A': 'bg-blue-100 text-blue-700 border-blue-200',
  'Series B': 'bg-purple-100 text-purple-700 border-purple-200',
  'Series C': 'bg-orange-100 text-orange-700 border-orange-200',
  'Series D+': 'bg-red-100 text-red-700 border-red-200',
  'Unicorn': 'bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border-amber-200',
};

const Startups = () => {
  const navigate = useNavigate();
  const { startups, getStartups, getStartupJobs, isLoading } = useJobStore();
  
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [startupJobs, setStartupJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [fundingFilter, setFundingFilter] = useState('all');

  useEffect(() => {
    getStartups();
  }, [getStartups]);

  const handleStartupClick = async (startup) => {
    setSelectedStartup(startup);
    setLoadingJobs(true);
    const jobs = await getStartupJobs(startup.company);
    setStartupJobs(jobs);
    setLoadingJobs(false);
  };

  const filteredStartups = startups.filter(startup =>
    startup.company.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(startup => 
    fundingFilter === 'all' || startup.funding_stage === fundingFilter
  );

  // Get unique funding stages from startups
  const fundingStages = ['all', ...new Set(startups.map(s => s.funding_stage).filter(Boolean))];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto" data-testid="startups-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-primary" />
              Startup Jobs
            </h1>
            <p className="text-slate-600 mt-1">Connect directly with founders at Seed to Unicorn startups</p>
          </div>
          
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="list" className="data-[state=active]:bg-white" data-testid="list-view-btn">
                <List className="w-4 h-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="map" className="data-[state=active]:bg-white" data-testid="map-view-btn">
                <Map className="w-4 h-4 mr-2" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search startups..."
              className="pl-10"
              data-testid="startup-search-input"
            />
          </div>
          
          {/* Funding Stage Filters */}
          <div className="flex flex-wrap gap-2">
            {fundingStages.map((stage) => (
              <button
                key={stage}
                onClick={() => setFundingFilter(stage)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  fundingFilter === stage
                    ? 'bg-primary text-white'
                    : stage === 'all'
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : fundingStageColors[stage] || 'bg-slate-100 text-slate-600'
                }`}
              >
                {stage === 'all' ? 'All Stages' : stage}
                {stage === 'Unicorn' && ' 🦄'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Startup List */}
          <div className={selectedStartup ? 'lg:col-span-5' : 'lg:col-span-12'}>
            {view === 'map' ? (
              <div className="bg-slate-100 rounded-xl p-12 text-center" data-testid="map-placeholder">
                <Map className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Map Coming Soon</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Add MAPBOX_TOKEN to enable map view
                </p>
                <Button variant="outline" onClick={() => setView('list')}>
                  View as List
                </Button>
              </div>
            ) : isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border border-slate-100">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredStartups.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No startups found</h3>
                <p className="text-slate-500">Try adjusting your search</p>
              </div>
            ) : (
              <div className={`grid ${selectedStartup ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                {filteredStartups.map((startup) => (
                  <Card
                    key={startup.startup_id}
                    className={`border-slate-100 cursor-pointer transition-all hover:border-blue-200 hover:shadow-md ${
                      selectedStartup?.startup_id === startup.startup_id ? 'border-blue-500 shadow-md' : ''
                    }`}
                    onClick={() => handleStartupClick(startup)}
                    data-testid={`startup-card-${startup.startup_id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                            {startup.funding_stage === 'Unicorn' ? (
                              <Trophy className="w-6 h-6 text-amber-500" />
                            ) : (
                              <Building2 className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-1">{startup.company}</h3>
                          {startup.funding_stage && (
                            <Badge className={`text-xs mb-2 ${fundingStageColors[startup.funding_stage] || 'bg-slate-100 text-slate-600'}`}>
                              {startup.funding_stage} {startup.funding_stage === 'Unicorn' && '🦄'}
                            </Badge>
                          )}
                          {startup.lat && startup.lng && (
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              View on map
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {startup.job_count} jobs
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Selected Startup Jobs */}
          {selectedStartup && (
            <div className="lg:col-span-7 animate-slide-in-right" data-testid="startup-jobs-panel">
              <div className="bg-white rounded-xl border border-slate-100 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedStartup.company}</h2>
                    <p className="text-slate-500">{selectedStartup.job_count} open positions</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStartup(null)}
                  >
                    Close
                  </Button>
                </div>

                {loadingJobs ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : startupJobs.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No jobs available</p>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {startupJobs.map((job) => (
                      <div
                        key={job.job_id}
                        className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/jobs/${job.job_id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{job.title}</h4>
                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                              <span className="text-slate-300">•</span>
                              {job.experience_level} level
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.skills_required?.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills_required?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills_required.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Startups;
