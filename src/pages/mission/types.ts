export type MissionBlogPost = {
  id: string;
  contentId: string;
  title: string;
  excerpt: string;
  author: 'narrator' | 'pilot' | 'staff';
  publishedAt: string;
};

