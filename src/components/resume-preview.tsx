import type { Template } from '@/lib/types';
import { Mail, Phone, Link as LinkIcon, Linkedin } from 'lucide-react';

interface ResumePreviewProps {
  template: Template;
  // This component is now only used for previews, so we can hardcode content
}

const placeholderContent = {
    contact: {
        name: 'Your Name',
        email: 'your.email@example.com',
        phone: '+1 234 567 890',
        website: 'yourportfolio.com',
        linkedin: 'linkedin.com/in/yourprofile',
    },
    summary: 'Highly motivated and detail-oriented professional with a passion for developing innovative software solutions. Seeking an entry-level position to apply academic knowledge and practical skills in a dynamic team environment. Eager to contribute to company success and grow as a software developer.',
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'Python', 'SQL', 'Git', 'Docker', 'Teamwork', 'Communication', 'Problem Solving', 'Project Management', 'Agile Methodologies'],
    experience: [
        {
            title: 'Software Engineer Intern',
            company: 'Tech Solutions Inc.',
            dates: 'Jun 2023 - Aug 2023',
            description: '• Developed and maintained web applications using React and Node.js, resulting in a 15% performance improvement.\n• Collaborated with a team of 5 developers to design and implement new features for a client-facing project, improving user satisfaction by 10%.\n• Wrote unit tests and integration tests to ensure code quality and reliability.'
        },
        {
            title: 'Freelance Web Developer',
            company: 'Self-Employed',
            dates: 'Jan 2022 - May 2023',
            description: '• Built and deployed 5+ full-stack web applications for small businesses, using React, Next.js, and Firebase.\n• Managed client communication, project timelines, and deliverables from conception to completion.'
        },
        {
            title: 'Customer Service Associate',
            company: 'Retail Corp',
            dates: 'May 2022 - Aug 2022',
            description: '• Assisted over 50 customers daily, resolving inquiries and providing product information.\n• Received Employee of the Month award for outstanding customer satisfaction.'
        }
    ],
    education: [
        {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Technology',
            dates: '2020 - 2024'
        },
        {
            degree: 'High School Diploma',
            institution: 'Central High School',
            dates: '2016 - 2020'
        }
    ],
    projects: [
      { name: 'Personal Portfolio Website', description: 'Designed and built a responsive portfolio website using Next.js and Tailwind CSS to showcase my projects and skills.' },
      { name: 'E-commerce Platform', description: 'A full-stack e-commerce site with user authentication, product catalog, and a shopping cart using the MERN stack.' },
    ],
    certifications: [
      { name: 'Certified JavaScript Developer', source: 'Code Academy' },
      { name: 'Google Cloud Certified - Associate Cloud Engineer', source: 'Google Cloud' },
    ],
    achievements: [
        { value: 'Dean\'s List 2023 & 2024' },
        { value: 'Winner, University Hackathon 2023' },
        { value: 'Published an article on modern web development on a popular tech blog.' },
    ],
    publications: [
      { title: 'The Future of AI in Web Development', url: 'https://example.com/publication' },
      { title: 'A Guide to Serverless Functions', url: 'https://example.com/publication2' },
    ],
    portfolio: 'https://yourportfolio.com',
    references: 'Available upon request',
};

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-4">
        <h2 className="text-sm font-bold border-b-2 border-gray-300 pb-1 mb-2 tracking-widest uppercase">{title}</h2>
        {children}
    </div>
)

const ResumePreview = ({ template }: ResumePreviewProps) => {
    return (
        <div className="bg-white text-gray-800 p-6 w-[800px] h-[1131px] font-sans text-[10px] leading-relaxed">
             <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-wider">{placeholderContent.contact.name}</h1>
                <p className="text-[9px] mt-1">
                    {placeholderContent.contact.email} &bull; {placeholderContent.contact.phone} &bull; {placeholderContent.contact.linkedin}
                </p>
             </div>

            {template.sections.map(section => {
                switch(section) {
                    case 'summary':
                        return (
                             <Section key={section} title="Summary">
                                <p>{placeholderContent.summary}</p>
                            </Section>
                        )
                    case 'skills':
                        return (
                            <Section key={section} title="Skills">
                                <p>{placeholderContent.skills.join(' &bull; ')}</p>
                            </Section>
                        )
                    case 'experience':
                        return (
                             <Section key={section} title="Experience">
                                {placeholderContent.experience.map((exp, i) => (
                                    <div key={i} className="mb-3">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold">{exp.title}</h3>
                                            <p className="font-light text-[9px]">{exp.dates}</p>
                                        </div>
                                        <p className="italic text-[9px]">{exp.company}</p>
                                        <ul className="mt-1 list-disc list-inside text-gray-700">
                                          {exp.description.split('\n').map((line, j) => <li key={j}>{line.replace('• ', '')}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </Section>
                        )
                    case 'education':
                        return (
                            <Section key={section} title="Education">
                                {placeholderContent.education.map((edu, i) => (
                                    <div key={i} className="mb-2">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold">{edu.degree}</h3>
                                            <p className="font-light text-[9px]">{edu.dates}</p>
                                        </div>
                                        <p className="italic">{edu.institution}</p>
                                    </div>
                                ))}
                            </Section>
                        )
                    case 'projects':
                        return (
                             <Section key={section} title="Projects">
                                {placeholderContent.projects.map((proj, i) => (
                                    <div key={i} className="mb-2">
                                        <h3 className="font-bold">{proj.name}</h3>
                                        <p>{proj.description}</p>
                                    </div>
                                ))}
                            </Section>
                        )
                    case 'certifications':
                         return (
                             <Section key={section} title="Certifications">
                                {placeholderContent.certifications.map((cert, i) => (
                                    <div key={i} className="mb-1">
                                      <span className="font-bold">{cert.name}</span> - <span className="italic">{cert.source}</span>
                                    </div>
                                  ))}
                            </Section>
                        )
                    case 'achievements':
                        return (
                            <Section key={section} title="Achievements">
                               <ul className="list-disc list-inside">
                                   {placeholderContent.achievements.map((ach, i) => <li key={i}>{ach.value}</li>)}
                               </ul>
                           </Section>
                       );
                    case 'publications':
                        return (
                           <Section key={section} title="Publications">
                               {placeholderContent.publications.map((p,i) => (
                                <div key={i} className="flex justify-between">
                                  <span>{p.title}</span>
                                  <a href={p.url} className="text-blue-600 hover:underline">Link</a>
                                </div>
                               ))}
                           </Section>
                       );
                   case 'portfolio':
                        return (
                           <Section key={section} title="Portfolio">
                               <a href={placeholderContent.portfolio} className="text-blue-600 hover:underline">{placeholderContent.portfolio}</a>
                           </Section>
                       );
                   case 'references':
                       return (
                           <Section key={section} title="References">
                               <p>{placeholderContent.references}</p>
                           </Section>
                       );
                    default:
                        return null;
                }
            })}
        </div>
    );
}

export default ResumePreview;
