import type { BlogPost } from "../pages/blog";

export async function generateRSSFeed(baseUrl: string): Promise<string> {
  // Fetch blog posts from API
  const response = await fetch(`${baseUrl}/api/blog`);
  if (!response.ok) throw new Error('Failed to fetch blog posts for RSS feed');
  const posts: BlogPost[] = await response.json();

  const latestPosts = [...posts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const rssItems = latestPosts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <category>${post.category}</category>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Learn Sensei Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Latest insights in AI-powered learning and educational technology</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;
}