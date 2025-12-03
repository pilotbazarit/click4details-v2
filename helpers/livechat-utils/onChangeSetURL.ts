import { toast } from 'react-toastify';
import imageUpload from './imageUpload';

export default function onChangeSetURL(
  setUrlFunc: any,
  type: 'image' | 'others',
  setLoadingFunc?: any
) {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target.files?.length) return;
    const files = e?.target.files;
    const file = files[0];

    let isError = false;

    if (type === 'image') {
      Array.from(files).forEach((file) => {
        if (!file?.type?.includes('image')) {
          isError = true;
        }
      });
    }

    if (isError) {
      toast.error('Please upload image files');
      e.target.value = '';
      return;
    }

    if (files?.length > 1) {
      for (let i = 0; i < files?.length; i++) {
        if (files[i]?.size > 100000000) {
          toast.error('Maximum file size is 100MB');
          e.target.value = '';
          return;
        }
        const data = await imageUpload(files[i], setLoadingFunc);
        (await setUrlFunc) &&
          setUrlFunc(
            data?.url,
            files[i]?.type?.startsWith('image')
              ? 'image'
              : files[i]?.type?.startsWith('video')
              ? 'video'
              : files[i]?.type?.startsWith('audio')
              ? 'audio'
              : 'others'
          );
      }
    } else {
      if (file?.size > 100000000) {
        toast.error('Maximum file size is 100MB');
        e.target.value = '';
        return;
      }
      const data = await imageUpload(file, setLoadingFunc);
      setUrlFunc &&
        setUrlFunc(
          data?.url,
          file?.type?.startsWith('image')
            ? 'image'
            : file?.type?.startsWith('video')
            ? 'video'
            : file?.type?.startsWith('audio')
            ? 'audio'
            : 'others'
        );
    }
  };
}
