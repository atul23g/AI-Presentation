import { getProjectById } from '@/actions/project';
import { redirect } from 'next/navigation';
import SharePresentationView from './_components/SharePresentationView';

type Props = {
  params: Promise<{
    presentationId: string;
  }>;
};

const SharePage = async ({ params }: Props) => {
  try {
    const { presentationId } = await params;
    const res = await getProjectById(presentationId);
    
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

