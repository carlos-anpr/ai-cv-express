import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import React, { useContext, useState, useEffect } from 'react';
import GlobalApi from '../../../../../service/GlobalApi';
import { useParams } from 'react-router-dom';
import { LoaderCircle, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AIChatSession } from '../../../../../service/AIModal';

const prompt =
  'Job Title: {jobTitle} , Depends on job title give me list of  summary for 3 experience level, Mid Level and Freasher level in 5-6 lines in array format, With summary and experience_level Field in JSON Format.';

function Summary({ enableNext }) {
  const params = useParams();
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const [summary, setSummary] = useState(resumeInfo?.summary || '');
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummeryList, setAiGenerateSummaryList] = useState(null);

  useEffect(() => {
    enableNext(false);
    if (summary) {
      setResumeInfo({
        ...resumeInfo,
        summary,
      });
    }
  }, [summary]);

  const GenerateSummaryFromAI = async () => {
    setLoading(true);
    try {
      const PROMPT = prompt.replace('jobTitle', resumeInfo?.jobTitle);
      const result = await AIChatSession.sendMessage(PROMPT);
      const generatedList = JSON.parse(result.response.text());
      setAiGenerateSummaryList(generatedList);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSave = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      data: {
        summary,
      },
    };

    GlobalApi.UpdateResumeDetail(params?.resumeId, data).then(
      (resp) => {
        console.log(resp);
        setLoading(false);
        enableNext(true);
        toast('Details updated');
      },
      () => setLoading(false)
    );
  };

  return (
    <div>
      <div className="p-5 shadow-lg border-t-primary border-t-4 mt-10 rounded-lg">
        <h2 className="font-bold text-lg">Summary Detail</h2>
        <p>Add Summary for your job title</p>
        <form className="mt-7" onSubmit={onSave}>
          <div className="flex justify-between items-end">
            <label>Add Summary</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-primary text-primary"
              onClick={() => GenerateSummaryFromAI()}
            >
              <WandSparkles className="h-4 w-4" /> Generate from AI
            </Button>
          </div>
          <Textarea
            className="mt-5"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button disabled={loading} type="submit">
              {loading ? <LoaderCircle className="animate-spin" /> : null}
              Save
            </Button>
          </div>
        </form>
      </div>

      {aiGeneratedSummeryList && (
        <div className="my-5">
          <h2 className="font-bold text-lg">Suggestions</h2>
          {aiGeneratedSummeryList?.map((item, index) => (
            <div
              key={index}
              onClick={() => setSummary(item?.summary)}
              className="p-5 shadow-lg my-4 rounded-lg cursor-pointer"
            >
              <h2 className="font-bold my-1 text-primary">
                Level: {item?.experience_level}
              </h2>
              <p>{item?.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Summary;
