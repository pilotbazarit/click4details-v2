import { toast } from 'react-toastify';
import { getApiUrl } from './getApiUrl';

export default async function imageUpload(file: any, setLoading?: any) {
  if (!file) return;

  if (setLoading) {
    setLoading(true);
  }

  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`${getApiUrl()}/upload/single`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error: any) {
    console.log(error);
    toast.error(error?.message || 'Failed to upload image');
  } finally {
    if (setLoading) {
      setLoading(false);
    }
  }
}
