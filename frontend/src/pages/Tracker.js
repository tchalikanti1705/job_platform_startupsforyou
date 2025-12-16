import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../store';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Briefcase, Calendar, Clock, Building2, 
  MoreVertical, Trash2, ExternalLink, FileText
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_COLUMNS = [
  { key: 'Applied', label: 'Applied', color: 'bg-blue-500' },
  { key: 'Interview', label: 'Interview', color: 'bg-yellow-500' },
  { key: 'Offer', label: 'Offer', color: 'bg-green-500' },
  { key: 'Rejected', label: 'Rejected', color: 'bg-slate-400' }
];

const Tracker = () => {
  const navigate = useNavigate();
  const { 
    applications, getApplications, updateStatus, deleteApplication, 
    getGroupedApplications, isLoading 
  } = useApplicationStore();
  
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getApplications();
  }, [getApplications]);

  const groupedApps = getGroupedApplications();

  const handleStatusChange = async () => {
    if (!selectedApp || !newStatus) return;
    
    setIsUpdating(true);
    const result = await updateStatus(selectedApp.application_id, newStatus, notes || null);
    setIsUpdating(false);
    
    if (result.success) {
      toast.success('Status updated');
      setSelectedApp(null);
      setNewStatus('');
      setNotes('');
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (applicationId) => {
    const result = await deleteApplication(applicationId);
    if (result.success) {
      toast.success('Application removed');
    } else {
      toast.error('Failed to remove application');
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

  const ApplicationCard = ({ app }) => (
    <Card className="border-slate-100 hover:border-blue-200 transition-colors group" data-testid={`app-card-${app.application_id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 truncate">
              {app.job_title || 'Unknown Position'}
            </h4>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3" />
              {app.company || 'Unknown Company'}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/jobs/${app.job_id}`)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedApp(app); setNewStatus(app.status); }}>
                <FileText className="w-4 h-4 mr-2" />
                Update Status
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(app.application_id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3 space-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Applied: {formatDate(app.applied_at)}
          </div>
          {app.deadline && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Deadline: {formatDate(app.deadline)}
            </div>
          )}
        </div>
        
        {app.notes && (
          <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded p-2 line-clamp-2">
            {app.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div data-testid="tracker-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Application Tracker</h1>
            <p className="text-slate-600 mt-1">Track your job applications</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              {applications.length} applications
            </Badge>
          </div>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map((col) => (
              <div key={col.key} className="min-w-[300px] w-[350px]">
                <Skeleton className="h-8 w-full mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4" data-testid="kanban-board">
            {STATUS_COLUMNS.map((column) => (
              <div 
                key={column.key} 
                className="min-w-[300px] w-[350px] flex flex-col"
                data-testid={`column-${column.key.toLowerCase()}`}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-slate-900">{column.label}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {groupedApps[column.key]?.length || 0}
                  </Badge>
                </div>
                
                {/* Column Content */}
                <div className="flex-1 bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3 min-h-[200px]">
                  {groupedApps[column.key]?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No applications
                    </div>
                  ) : (
                    groupedApps[column.key]?.map((app) => (
                      <ApplicationCard key={app.application_id} app={app} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
            <p className="text-slate-600 mb-4">Start applying to jobs to track them here</p>
            <Button onClick={() => navigate('/jobs')} className="rounded-full">
              Browse Jobs
            </Button>
          </div>
        )}

        {/* Status Update Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Application Status</DialogTitle>
              <DialogDescription>
                {selectedApp?.job_title} at {selectedApp?.company}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Status
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="status-select">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_COLUMNS.map((col) => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this status change..."
                  rows={3}
                  data-testid="notes-input"
                />
              </div>
              
              <Button 
                onClick={handleStatusChange} 
                className="w-full rounded-full"
                disabled={isUpdating || !newStatus}
                data-testid="save-status-btn"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Tracker;
