import getOriginalFileName from './getOriginalFileName';

export default function downloadAttachment(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = getOriginalFileName(url) || '';
  a.click();
}
