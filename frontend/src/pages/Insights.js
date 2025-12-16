import { useEffect } from 'react';
import { useInsightsStore } from '../store';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '../components/ui/table';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Briefcase, TrendingUp, Target, Calendar, Clock, Send, Users, Award } from 'lucide-react';
import { format } from 'date-fns';

const Insights = () => {
  const { 
    summary, timeseries, funnel, tableData, 
    isLoading, timeRange, setTimeRange, fetchAllInsights, getTimeseries 
  } = useInsightsStore();

  useEffect(() => {
    fetchAllInsights();
  }, [fetchAllInsights]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    getTimeseries(range);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const KPICard = ({ icon: Icon, label, value, subValue, color = 'blue' }) => (
    <Card className="border-slate-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {subValue && (
              <p className="text-sm text-slate-500 mt-1">{subValue}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-500`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto" data-testid="insights-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Insights</h1>
            <p className="text-slate-600 mt-1">Track your job search progress</p>
          </div>
          
          <Tabs value={timeRange} onValueChange={handleTimeRangeChange}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="day" className="data-[state=active]:bg-white">Day</TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-white">Week</TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-white">Month</TabsTrigger>
              <TabsTrigger value="year" className="data-[state=active]:bg-white">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-slate-100">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="kpi-cards">
            <KPICard
              icon={Briefcase}
              label="Total Applications"
              value={summary?.total_applications || 0}
              subValue={`${summary?.this_week || 0} this week`}
            />
            <KPICard
              icon={TrendingUp}
              label="Response Rate"
              value={`${summary?.response_rate || 0}%`}
              subValue="From all applications"
              color="green"
            />
            <KPICard
              icon={Users}
              label="Interview Rate"
              value={`${summary?.interview_rate || 0}%`}
              subValue={`${summary?.by_status?.Interview || 0} interviews`}
              color="yellow"
            />
            <KPICard
              icon={Award}
              label="Offers"
              value={summary?.by_status?.Offer || 0}
              subValue={`${summary?.offer_rate || 0}% offer rate`}
              color="purple"
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Application Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : timeseries?.data?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={timeseries.data}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorApps)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funnel Chart */}
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Application Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : funnel?.stages?.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={funnel.stages} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [value, 'Count']}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : tableData?.data?.length > 0 ? (
              <div className="overflow-x-auto">
                <Table data-testid="applications-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.data.map((app) => (
                      <TableRow key={app.application_id}>
                        <TableCell className="font-medium">{app.job_title}</TableCell>
                        <TableCell>{app.company}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              app.status === 'Offer' ? 'default' :
                              app.status === 'Interview' ? 'secondary' :
                              app.status === 'Rejected' ? 'destructive' :
                              'outline'
                            }
                          >
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDate(app.applied_at)}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {formatDate(app.deadline)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No applications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Insights;
