import Header from '@/components/custom/Header';
import { Button } from '@/components/ui/button';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import ResumePreview from '@/dashboard/resume/components/ResumePreview';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GlobalApi from '../../../../service/GlobalApi';

function ResumeView() {
  const [resumeInfo, setResumeinfo] = useState();
  const { resumeId } = useParams();

  useEffect(() => {
    const getResumeInfo = () => {
      GlobalApi.GetResumeById(resumeId).then((resp) => {
        console.log(resp.data.data);
        setResumeinfo(resp.data.data);
      });
    };

    getResumeInfo();
  }, [resumeId]);

  const handleDownload = () => {
    window.print();
  };

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeinfo }}>
      <div id="no-print">
        <Header />
        <div className="mt-10 mx-10 md:mx-20 lg:mx-36">
          <h2 className="text-center text-2xl font-medium">
            Congrats! Your Ultimate AI generates Resume is ready!
            <p className="text-center text-gray-400">
              Now you are ready to download yot resume and yoy can share url
              with your friends and family
            </p>
          </h2>
          <div className="flex justify-between px-44 my-10">
            <Button onClick={handleDownload}>Download</Button>
            <Button>Share</Button>
          </div>
        </div>
      </div>
      <div className="my-10 mx-10 md:mx-20 lg:mx-80">
        <div id="print-area">
          <ResumePreview />
        </div>
      </div>
    </ResumeInfoContext.Provider>
  );
}

export default ResumeView;
