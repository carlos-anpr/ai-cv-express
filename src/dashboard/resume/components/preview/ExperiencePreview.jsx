import React from 'react';

function ExperiencePreview({ resumeInfo }) {
  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{
          color: resumeInfo?.themeColor,
        }}
      >
        Experiencia Profesional
      </h2>
      <hr
        style={{
          borderColor: resumeInfo?.themeColor,
        }}
      />
      {resumeInfo?.experience?.map((experience, index) => (
        <div key={index} className="my-5">
          <h2
            className="text-sm font-bold"
            style={{
              color: resumeInfo?.themeColor,
            }}
          >
            {experience?.title}
          </h2>
          <h2 className="text-xs flex justify-between items-center mt-0.5">
            <span
              className="font-semibold text-primary"
              style={{ color: resumeInfo?.themeColor }}
            >
              {experience?.companyName}
            </span>
            <span className="text-gray-700 ml-2">
              {experience?.city}
              {experience?.state ? `, ${experience?.state}` : ''}
            </span>
            <span
              className="font-semibold text-primary ml-2"
              style={{ color: resumeInfo?.themeColor }}
            >
              {experience?.startDate} -{' '}
              {experience?.currentlyWorking
                ? 'Actualidad'
                : experience?.endDate}
            </span>
          </h2>
          {/* <p className='text-xs my-2'>
                    {experience.workSummary}
                </p> */}

          <div
            className="text-xs my-2"
            dangerouslySetInnerHTML={{ __html: experience?.workSummary }}
          />
        </div>
      ))}
    </div>
  );
}

export default ExperiencePreview;
