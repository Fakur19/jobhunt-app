import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, User } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  paper?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, paper }) => {
  const content = (
    <div className="space-y-6 sm:space-y-8 font-serif text-slate-900 p-[0.75in] bg-white">
      {/* Header */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center sm:items-start gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{data.name || 'Your Name'}</h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
            {data.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {data.email}</span>}
            {data.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {data.phone}</span>}
            {data.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.location}</span>}
          </div>
        </div>
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
          {data.headshotUrl ? (
            <div className="w-full h-full relative flex items-center justify-center">
              <img 
                src={data.headshotUrl} 
                alt="Headshot" 
                className="max-w-full max-h-full w-auto h-auto object-contain origin-center" 
                style={{
                  transform: `scale(${data.headshotSettings?.scale || 1}) translate(${data.headshotSettings?.x || 0}%, ${data.headshotSettings?.y || 0}%)`
                }}
                referrerPolicy="no-referrer" 
              />
            </div>
          ) : (
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1">Professional Summary</h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 text-justify hyphens-auto">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1">Experience</h2>
          <div className="space-y-6">
            {data.experience.map((exp, i) => (
              <div key={i} className="space-y-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1">
                  <h3 className="font-bold text-sm sm:text-base">{exp.role}</h3>
                  <span className="text-[10px] sm:text-xs text-slate-500 italic">{exp.dates}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">{exp.company}</p>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap mt-2 leading-relaxed text-justify hyphens-auto">{exp.responsibilities}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, i) => (
              <div key={i} className="space-y-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1">
                  <h3 className="font-bold text-sm sm:text-base">{edu.degree}</h3>
                  <span className="text-[10px] sm:text-xs text-slate-500 italic">{edu.dates}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">{edu.school}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold uppercase tracking-widest text-blue-700 border-b border-blue-100 pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span key={i} className="text-xs sm:text-sm text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (paper) {
    return (
      <div className="w-full bg-slate-200 p-4 sm:p-8 flex justify-center overflow-auto min-h-full">
        <div className="w-full max-w-[1100px] bg-white shadow-2xl border border-slate-200 min-h-[11in] p-[0.5in] sm:p-[0.75in] relative flex flex-col">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {content}
    </div>
  );
};
