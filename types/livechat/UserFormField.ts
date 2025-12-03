export default interface UserFormField {
  id: string;
  label: string;
  type: 'input' | 'textarea' | 'select';
  options: string[];
  required: boolean;
}
