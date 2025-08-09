import { getProjectById } from '@/actions/project';
import { redirect } from 'next/navigation';
import SharePresentationView from './_components/SharePresentationView';

type Props = {
  params: {
    presentationId: string;
  };
};

const SharePage = async ({ params }: Props) => {
  try {
    const res = await getProjectById(params.presentationId);
    
    if (res.status !== 200 || !res.data) {
      redirect('/');
      return;
    }

    return <SharePresentationView project={res.data} />;
  } catch (error) {
    redirect('/');
    return;
  }
};

export default SharePage;

