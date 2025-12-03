export default function getOriginalFileName(url: string) {
  return url.split('/').pop();
}
