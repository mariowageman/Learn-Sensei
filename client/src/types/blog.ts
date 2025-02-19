export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  updatedAt?: string;
}
