export default interface Agent {
  id: string;
  name: string;
  picture: string;
  status: 'online' | 'offline';
}
