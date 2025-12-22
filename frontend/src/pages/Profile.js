import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore, useAuthStore } from '../store';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Award, FolderGit2, Globe, Github, Linkedin, Calendar,
  Building2, FileText, Edit, Loader2, ExternalLink
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, isLoading, getProfile } = useProfileStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      await getProfile();
      setLoaded(true);
    };
    loadProfile();
  }, [getProfile]);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!loaded || isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = user?.email || '';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary to-blue-600" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-12">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={user?.picture} alt={displayName} />
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-4 sm:pt-0">
                <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                {profile?.summary && (
                  <p className="text-slate-600 mt-1 line-clamp-2">{profile.summary}</p>
                )}
              </div>
              <Button onClick={() => navigate('/onboarding')} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {displayEmail}
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {profile.phone}
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {profile.location}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 mt-4">
              {profile?.linkedin && (
                <a 
                  href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {profile?.github && (
                <a 
                  href={profile.github.startsWith('http') ? profile.github : `https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-slate-700 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {profile?.portfolio && (
                <a 
                  href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-emerald-600 hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {profile?.experience && profile.experience.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Experience
                {profile.total_years_experience && (
                  <span className="text-sm font-normal text-slate-500">
                    ({profile.total_years_experience} years)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-slate-200">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-white" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {exp.company || 'Company'}
                      </h3>
                      <p className="text-slate-600">{exp.title || 'Position'}</p>
                    </div>
                    <div className="flex flex-col sm:items-end text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {exp.start_date || exp.duration || 'Date'}
                        {exp.end_date && ` - ${exp.end_date}`}
                        {exp.is_current && <Badge variant="outline" className="ml-2 text-xs">Current</Badge>}
                      </div>
                      {exp.location && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                      {exp.achievements.map((achievement, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {exp.description && !exp.achievements?.length && (
                    <p className="mt-2 text-sm text-slate-600">{exp.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {profile?.education && profile.education.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {edu.institution || edu.school || 'Institution'}
                        </h3>
                        <p className="text-slate-600">
                          {edu.degree}
                          {edu.field && ` in ${edu.field}`}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500">
                        {edu.start_date && edu.end_date ? (
                          <span>{edu.start_date} - {edu.end_date}</span>
                        ) : edu.year ? (
                          <span>{edu.year}</span>
                        ) : null}
                        {edu.gpa && (
                          <span className="ml-2 text-slate-600">GPA: {edu.gpa}</span>
                        )}
                      </div>
                    </div>
                    {edu.achievements && edu.achievements.length > 0 && (
                      <ul className="mt-2 text-sm text-slate-600">
                        {edu.achievements.map((a, aIdx) => (
                          <li key={aIdx}>• {a}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {profile?.projects && profile.projects.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-primary" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.projects.map((project, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{project.name}</h3>
                    {project.url && (
                      <a 
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.technologies.map((tech, tIdx) => (
                        <Badge key={tIdx} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {project.achievements && project.achievements.length > 0 && (
                    <ul className="mt-2 text-sm text-slate-600">
                      {project.achievements.map((a, aIdx) => (
                        <li key={aIdx}>• {a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {profile?.certifications && profile.certifications.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-slate-900">{cert.name}</h3>
                        {cert.issuer && (
                          <p className="text-sm text-slate-600">{cert.issuer}</p>
                        )}
                      </div>
                      {cert.date && (
                        <span className="text-sm text-slate-500">{cert.date}</span>
                      )}
                    </div>
                    {cert.credential_id && (
                      <p className="text-xs text-slate-400 mt-0.5">ID: {cert.credential_id}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {profile?.languages && profile.languages.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang, idx) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1">
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {(!profile?.skills?.length && !profile?.experience?.length && !profile?.education?.length) && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No profile data yet</h3>
              <p className="text-slate-500 mb-4">
                Upload your resume to automatically fill in your profile
              </p>
              <Button onClick={() => navigate('/onboarding')}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
