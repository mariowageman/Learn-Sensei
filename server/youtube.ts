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
    const response = await youtube.search.list({
      part: ['snippet'],
      q: `${query} educational tutorial`,
      type: ['video'],
      videoEmbeddable: 'true',
      maxResults,
      relevanceLanguage: 'en',
      videoCategoryId: '27', // Education category
      safeSearch: 'strict'
    });

    return (response.data.items || [])
      .filter(item => item.id?.videoId && item.snippet?.title)
      .map(item => ({
        title: item.snippet!.title!,
        videoId: item.id!.videoId!
      }));
  } catch (error) {
    console.error('YouTube API error:', error);
    return [];
  }
}
