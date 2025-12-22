import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useProfileStore, useAuthStore } from '../store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Upload, FileText, Loader2, Check, X, Plus, Briefcase, ArrowRight,
  GraduationCap, Building2, Award, MapPin, Calendar, Globe, Github
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
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    summary: '',
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: []
  });
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
          // Update form with ALL parsed data
          if (status.parsed_data) {
            setFormData(prev => ({
              ...prev,
              name: status.parsed_data.name || prev.name,
              phone: status.parsed_data.phone || '',
              location: status.parsed_data.location || '',
              linkedin: status.parsed_data.linkedin || '',
              github: status.parsed_data.github || '',
              summary: status.parsed_data.summary || '',
              skills: status.parsed_data.skills || [],
              education: status.parsed_data.education || [],
              experience: status.parsed_data.experience || [],
              projects: status.parsed_data.projects || [],
              certifications: status.parsed_data.certifications || []
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
    accept: { 
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
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

  const handleSkipOnboarding = async () => {
    setIsSubmitting(true);
    const result = await completeOnboarding();
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/home');
    } else {
      navigate('/jobs');
    }
  };

  const getProgress = () => {
    const stepIndex = STEPS.indexOf(step);
    return ((stepIndex + 1) / STEPS.length) * 100;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">RolesForU</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Let's set up your profile</h1>
          <p className="text-slate-600 mt-2">This helps us find the best startup jobs for you</p>
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
                    <p className="text-slate-400 text-xs">PDF, DOCX, or TXT files, max 10MB</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2 items-center">
                <Button
                  variant="ghost"
                  onClick={skipResume}
                  className="text-slate-500"
                  data-testid="skip-resume-btn"
                >
                  Skip resume upload
                </Button>
                <Button
                  variant="link"
                  onClick={handleSkipOnboarding}
                  className="text-slate-400 text-sm"
                  disabled={isSubmitting}
                  data-testid="skip-onboarding-btn"
                >
                  {isSubmitting ? 'Loading...' : 'Skip entire onboarding'}
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

        {/* Profile Step - Classic Resume Layout */}
        {step === 'profile' && (
          <Card className="border-slate-200 animate-fade-in" data-testid="profile-step">
            <CardHeader className="border-b">
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Review the information extracted from your resume</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* Header Section - Name & Contact */}
              <div className="text-center pb-6 border-b border-slate-200">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-2xl font-bold text-center border-none shadow-none text-slate-900 mb-3"
                  placeholder="Your Full Name"
                  data-testid="profile-name-input"
                />
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                  {formData.phone && (
                    <span className="flex items-center gap-1">
                      📞 {formData.phone}
                    </span>
                  )}
                  {formData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {formData.location}
                    </span>
                  )}
                  {formData.linkedin && (
                    <a href={`https://${formData.linkedin}`} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {formData.github && (
                    <a href={`https://${formData.github}`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 text-primary hover:underline">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Summary */}
              {formData.summary && (
                <div className="py-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Summary</h3>
                  <p className="text-slate-700 leading-relaxed">{formData.summary}</p>
                </div>
              )}

              {/* Experience Section */}
              {formData.experience.length > 0 && (
                <div className="py-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Experience
                  </h3>
                  <div className="space-y-6">
                    {formData.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        {/* Row 1: Company Name + Date */}
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <h4 className="font-bold text-slate-900 text-base">
                            {exp.company || 'Company'}
                          </h4>
                          <span className="text-sm text-slate-500 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5" />
                            {exp.duration || (exp.start_date && exp.end_date 
                              ? `${exp.start_date} – ${exp.end_date}`
                              : 'Present')
                            }
                          </span>
                        </div>
                        
                        {/* Row 2: Job Title + Location */}
                        <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                          {exp.title && (
                            <span className="text-slate-700 font-medium">{exp.title}</span>
                          )}
                          {exp.location && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5" /> {exp.location}
                            </span>
                          )}
                        </div>
                        
                        {/* Bullet Points */}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="space-y-1.5 text-sm text-slate-700 mt-2">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="flex items-start gap-2">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {formData.education.length > 0 && (
                <div className="py-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Education
                  </h3>
                  <div className="space-y-4">
                    {formData.education.map((edu, index) => (
                      <div key={index} className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{edu.institution}</h4>
                          {edu.degree && (
                            <p className="text-slate-600">
                              {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                            </p>
                          )}
                          {edu.gpa && (
                            <p className="text-sm text-slate-500">GPA: {edu.gpa}</p>
                          )}
                        </div>
                        <div className="text-sm text-slate-500">
                          {edu.start_date && edu.end_date 
                            ? `${edu.start_date} – ${edu.end_date}`
                            : edu.year || ''
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {formData.certifications.length > 0 && (
                <div className="py-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="text-sm py-1 px-2">
                        {cert.name}
                        {cert.issuer && <span className="text-slate-400 ml-1">– {cert.issuer}</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              <div className="py-5">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Skills</h3>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    className="flex-1"
                    data-testid="skill-input"
                  />
                  <Button type="button" variant="outline" onClick={handleAddSkill} data-testid="add-skill-btn">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1.5">
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

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                className="w-full rounded-full mt-6"
                size="lg"
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
