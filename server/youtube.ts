import { google } from 'googleapis';
import { youtube_v3 } from 'googleapis';

if (!process.env.YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY environment variable is required');
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

interface VideoResult {
  title: string;
  videoId: string;
}

export async function searchEducationalVideos(query: string, maxResults = 3): Promise<VideoResult[]> {
  try {
    // Add educational qualifiers to the search query
    const enhancedQuery = `${query} tutorial explanation`;

    const response = await youtube.search.list({
      part: ['snippet'],
      q: enhancedQuery,
      type: ['video'],
      videoEmbeddable: 'true',
      maxResults,
      relevanceLanguage: 'en',
      videoCategoryId: '27', // Education category
      safeSearch: 'strict',
      // Additional parameters to improve educational content relevance
      order: 'relevance',
      videoDefinition: 'high',
      // Filter for videos that are likely to be tutorials/educational
      videoType: 'any'
    });

    return (response.data.items || [])
      .filter(item => {
        if (!item.id?.videoId || !item.snippet?.title || !item.snippet?.description) {
          return false;
        }

        // Additional filtering criteria for educational content
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();

        const educationalKeywords = [
          'tutorial', 'lesson', 'guide', 'explanation', 'learn', 
          'how to', 'course', 'education', 'teaching', 'explained'
        ];

        // Check if title or description contains educational keywords
        return educationalKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      })
      .map(item => ({
        title: item.snippet!.title!,
        videoId: item.id!.videoId!
      }))
      .slice(0, maxResults); // Ensure we only return the requested number of results
  } catch (error) {
    console.error('YouTube API error:', error);
    return [];
  }
}