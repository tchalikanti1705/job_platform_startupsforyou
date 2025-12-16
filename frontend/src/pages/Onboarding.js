import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useProfileStore, useAuthStore } from '../store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { 
  Upload, FileText, Loader2, Check, X, Plus, Briefcase, ArrowRight 
} from 'lucide-react';

const STEPS = ['upload', 'parsing', 'profile', 'complete'];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    profile, resume, isUploading, 
    uploadResume, checkResumeStatus, getProfile, updateProfile, completeOnboarding 
  } = useProfileStore();
  
  const [step, setStep] = useState('upload');
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    skills: [],
    experience_level: '',
    preferred_location: '',
    preferred_roles: []
  });
  const [roleInput, setRoleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || ''
      }));
    }
  }, [user]);

  // Poll resume status
  useEffect(() => {
    if (resume && step === 'parsing') {
      const interval = setInterval(async () => {
        const status = await checkResumeStatus(resume.resume_id);
        if (status?.status === 'done') {
          clearInterval(interval);
          // Update form with parsed data
          if (status.parsed_data) {
            setFormData(prev => ({
              ...prev,
              name: status.parsed_data.name || prev.name,
              skills: status.parsed_data.skills || []
            }));
          }
          setStep('profile');
        } else if (status?.status === 'failed') {
          clearInterval(interval);
          setStep('profile');
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [resume, step, checkResumeStatus]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const result = await uploadResume(file);
      if (result.success) {
        setStep('parsing');
      }
    }
  }, [uploadResume]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddRole = () => {
    if (roleInput.trim() && !formData.preferred_roles.includes(roleInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_roles: [...prev.preferred_roles, roleInput.trim()]
      }));
      setRoleInput('');
    }
  };

  const handleRemoveRole = (role) => {
    setFormData(prev => ({
      ...prev,
      preferred_roles: prev.preferred_roles.filter(r => r !== role)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    await updateProfile(formData);
    await completeOnboarding();
    
    setStep('complete');
    setIsSubmitting(false);
    
    // Redirect after animation
    setTimeout(() => {
      navigate('/home');
    }, 1500);
  };

  const skipResume = () => {
    setStep('profile');
  };

  const getProgress = () => {
    const stepIndex = STEPS.indexOf(step);
    return ((stepIndex + 1) / STEPS.length) * 100;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">JobHub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Let's set up your profile</h1>
          <p className="text-slate-600 mt-2">This helps us find the best jobs for you</p>
        </div>

        {/* Progress */}
        <Progress value={getProgress()} className="mb-8" />

        {/* Upload Step */}
        {step === 'upload' && (
          <Card className="border-slate-200 animate-fade-in" data-testid="upload-step">
            <CardHeader>
              <CardTitle>Upload your resume</CardTitle>
              <CardDescription>We'll extract your skills and experience automatically</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-primary bg-blue-50' 
                    : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                }`}
                data-testid="resume-dropzone"
              >
                <input {...getInputProps()} data-testid="resume-input" />
                {isUploading ? (
                  <div>
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Uploading...</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-900 font-medium mb-2">
                      {isDragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
                    </p>
                    <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                    <p className="text-slate-400 text-xs">PDF files only, max 10MB</p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={skipResume}
                  className="text-slate-500"
                  data-testid="skip-resume-btn"
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parsing Step */}
        {step === 'parsing' && (
          <Card className="border-slate-200 animate-fade-in" data-testid="parsing-step">
            <CardHeader>
              <CardTitle>Analyzing your resume</CardTitle>
              <CardDescription>Extracting your skills and experience...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="relative inline-flex">
                  <FileText className="w-16 h-16 text-primary" />
                  <Loader2 className="w-8 h-8 text-primary animate-spin absolute -right-2 -bottom-2" />
                </div>
                <p className="text-slate-600 mt-6">This may take a few seconds...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Step */}
        {step === 'profile' && (
          <Card className="border-slate-200 animate-fade-in" data-testid="profile-step">
            <CardHeader>
              <CardTitle>Complete your profile</CardTitle>
              <CardDescription>Review and add to your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  data-testid="profile-name-input"
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    data-testid="skill-input"
                  />
                  <Button type="button" variant="outline" onClick={handleAddSkill} data-testid="add-skill-btn">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 hover:bg-slate-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
                >
                  <SelectTrigger data-testid="experience-select">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Input
                  id="location"
                  value={formData.preferred_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_location: e.target.value }))}
                  placeholder="e.g., San Francisco, Remote"
                  data-testid="location-input"
                />
              </div>

              {/* Preferred Roles */}
              <div className="space-y-2">
                <Label>Preferred Job Titles</Label>
                <div className="flex gap-2">
                  <Input
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRole())}
                    data-testid="role-input"
                  />
                  <Button type="button" variant="outline" onClick={handleAddRole} data-testid="add-role-btn">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferred_roles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                      {role}
                      <button
                        onClick={() => handleRemoveRole(role)}
                        className="ml-2 hover:bg-slate-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full rounded-full mt-6"
                disabled={isSubmitting}
                data-testid="complete-profile-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Jobs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Card className="border-slate-200 animate-fade-in" data-testid="complete-step">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You're all set!</h2>
              <p className="text-slate-600">Redirecting you to your personalized job feed...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
