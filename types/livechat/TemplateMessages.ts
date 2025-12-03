export default interface TemplateMessage {
  id: string;
  question: string;
  answer: string;
  pictures: string[];
  chatId: string;
  showFirst: boolean;
}
