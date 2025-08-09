import type { Template } from '@/lib/types';
import { Mail, Phone, Link as LinkIcon, Linkedin } from 'lucide-react';

interface ResumePreviewProps {
  template: Template;
}

const placeholderContent = {
    contact: {
        name: 'Your Name',
        email: 'your.email@example.com',
        phone: '+1 234 567 890',
        website: 'yourportfolio.com',
        linkedin: 'linkedin.com/in/yourprofile',
    },
    summary: 'Highly motivated and detail-oriented professional seeking an entry-level position. Eager to apply academic knowledge and skills in a practical setting.',
    skills: ['Teamwork', 'Communication', 'Problem Solving', 'React', 'Node.js'],
    experience: [
        {
            title: 'Software Engineer Intern',
            company: 'Tech Solutions Inc.',
            dates: 'Jun 2023 - Aug 2023',
            description: '• Developed and maintained web applications using React and Node.js.\n• Collaborated with a team of developers to design and implement new features.'
        }
    ],
    education: [
        {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Technology',
            dates: '2020 - 2024'
        }
    ],
    projects: [
      { name: 'Personal Portfolio Website' },
    ],
    certifications: [
      { name: 'Certified JavaScript Developer' },
    ],
    achievements: [
        { value: 'Dean\'s List 2023' },
    ],
    publications: [
      { title: 'The Future of AI in Web Development' },
    ],
    portfolio: 'yourportfolio.com',
    references: 'Available upon request',
};

const ResumePreview = ({ template }: ResumePreviewProps) => {
    return (
        <div className="bg-white text-black p-8 w-[2000px] h-[2830px] font-sans">
             <div className="text-center mb-8">
                <h1 className="text-5xl font-bold">{placeholderContent.contact.name}</h1>
                <p className="text-lg flex justify-center items-center gap-x-4 mt-2">
                    <span>{placeholderContent.contact.email}</span>
                    <span>|</span>
                    <span>{placeholderContent.contact.phone}</span>
                </p>
             </div>

            {template.sections.map(section => {
                switch(section) {
                    case 'summary':
                        return (
                             <div key={section} className="mb-6">
                                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Summary</h2>
                                <p className="text-base">{placeholderContent.summary}</p>
                            </div>
                        )
                    case 'skills':
                        return (
                            <div key={section} className="mb-6">
                                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Skills</h2>
                                <p className="text-base">{placeholderContent.skills.join(' • ')}</p>
                            </div>
                        )
                    case 'experience':
                        return (
                             <div key={section} className="mb-6">
                                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Experience</h2>
                                {placeholderContent.experience.map((exp, i) => (
                                    <div key={i} className="mb-4 text-base">
                                        <h3 className="font-bold">{exp.title}</h3>
                                        <div className="flex justify-between">
                                            <p className="italic">{exp.company}</p>
                                            <p className="italic">{exp.dates}</p>
                                        </div>
                                        <ul className="mt-1 list-disc list-inside">
                                          {exp.description.split('\n').map((line, j) => <li key={j}>{line.replace('• ', '')}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )
                    case 'education':
                        return (
                            <div key={section} className="mb-6">
                                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Education</h2>
                                {placeholderContent.education.map((edu, i) => (
                                    <div key={i} className="mb-2 text-base">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold">{edu.degree}</h3>
                                            <p className="italic">{edu.dates}</p>
                                        </div>
                                        <p>{edu.institution}</p>
                                    </div>
                                ))}
                            </div>
                        )
                    case 'projects':
                        return (
                             <div key={section} className="mb-6">
                                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Projects</h2>
                                <ul className="list-disc list-inside text-base">
                                  {placeholderContent.projects.map((p,i) => <li key={i}>{p.name}</li>)}
                                </ul>
                            </div>
                        )
                    case 'certifications':
                         return (
                             <div key={section} className="mb-6">
                                <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Certifications</h2>
                                <ul className="list-disc list-inside text-base">
                                  {placeholderContent.certifications.map((c,i) => <li key={i}>{c.name}</li>)}
                                </ul>
                            </div>
                        )
                    case 'achievements':
                        return (
                            <div key={section} className="mb-6">
                               <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Achievements</h2>
                               <ul className="list-disc list-inside text-base">
                                   {placeholderContent.achievements.map((ach, i) => <li key={i}>{ach.value}</li>)}
                               </ul>
                           </div>
                       );
                    case 'publications':
                        return (
                           <div key={section} className="mb-6">
                               <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Publications</h2>
                               <ul className="list-disc list-inside text-base">
                                  {placeholderContent.publications.map((p,i) => <li key={i}>{p.title}</li>)}
                               </ul>
                           </div>
                       );
                   case 'portfolio':
                        return (
                           <div key={section} className="mb-6">
                               <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Portfolio</h2>
                               <p className="text-base">{placeholderContent.portfolio}</p>
                           </div>
                       );
                   case 'references':
                       return (
                           <div key={section} className="mb-6">
                               <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-1 mb-2">References</h2>
                               <p className="text-base">{placeholderContent.references}</p>
                           </div>
                       );
                    default:
                        return null;
                }
            })}
        </div>
    );
}

export default ResumePreview;
