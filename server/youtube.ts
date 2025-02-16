import { google } from 'googleapis';
import { youtube_v3 } from 'googleapis';

class YouTubeAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YouTubeAPIError';
  }
}

// Check if API key exists and has correct format
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  throw new YouTubeAPIError('YOUTUBE_API_KEY environment variable is required');
} else if (!YOUTUBE_API_KEY.startsWith('AIza')) {
  throw new YouTubeAPIError('Invalid YouTube API key format');
}

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});

interface VideoResult {
  title: string;
  videoId: string;
}

export async function searchEducationalVideos(query: string, maxResults = 3): Promise<VideoResult[]> {
  if (!query.trim()) {
    console.warn('Empty search query provided to searchEducationalVideos');
    return [];
  }

  try {
    // Request more results initially to ensure we have enough after filtering
    const initialResults = 10;

    // Add educational qualifiers to the search query
    const enhancedQuery = `${query} tutorial explanation`;

    const response = await youtube.search.list({
      part: ['snippet'],
      q: enhancedQuery,
      type: ['video'],
      videoEmbeddable: 'true',
      maxResults: initialResults,
      relevanceLanguage: 'en',
      videoCategoryId: '27', // Education category
      safeSearch: 'strict',
      order: 'relevance',
      videoDefinition: 'high'
    }).catch(error => {
      if (error.code === 403) {
        throw new YouTubeAPIError('YouTube API quota exceeded or invalid API key');
      }
      throw error;
    });

    if (!response.data.items?.length) {
      console.warn(`No videos found for query: ${query}`);
      return [];
    }

    // Filter and score videos based on relevance
    const scoredVideos = response.data.items
      .filter(item => {
        if (!item.id?.videoId || !item.snippet?.title || !item.snippet?.description) {
          return false;
        }

        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        const queryTerms = query.toLowerCase().split(' ');

        // Check if title or description contains query terms
        const hasQueryTerms = queryTerms.some(term => 
          title.includes(term) || description.includes(term)
        );

        // Educational content markers
        const educationalKeywords = [
          'tutorial', 'lesson', 'guide', 'explanation', 'learn', 
          'how to', 'course', 'education', 'teaching', 'explained'
        ];

        const hasEducationalKeyword = educationalKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );

        return hasQueryTerms && hasEducationalKeyword;
      })
      .map(item => {
        const title = item.snippet!.title!.toLowerCase();
        const description = item.snippet!.description!.toLowerCase();
        const queryTerms = query.toLowerCase().split(' ');

        // Calculate relevance score with higher weights for specific terms
        let score = 0;
        queryTerms.forEach(term => {
          // Higher weight for exact matches in title
          if (title.includes(` ${term} `)) score += 3;
          // Medium weight for partial matches in title
          else if (title.includes(term)) score += 2;
          // Lower weight for matches in description
          if (description.includes(term)) score += 1;
        });

        return {
          title: item.snippet!.title!,
          videoId: item.id!.videoId!,
          score
        };
      })
      .sort((a, b) => b.score - a.score) // Sort by relevance score
      .slice(0, maxResults); // Take top 3 most relevant videos

    // If we don't have enough results, make another attempt with broader terms
    if (scoredVideos.length < maxResults) {
      const [mainTerm, ...rest] = query.split(' ');
      const broadQuery = `${mainTerm} ${rest[0] || ''} basics tutorial`;

      const backupResponse = await youtube.search.list({
        part: ['snippet'],
        q: broadQuery,
        type: ['video'],
        videoEmbeddable: 'true',
        maxResults: maxResults - scoredVideos.length,
        relevanceLanguage: 'en',
        videoCategoryId: '27',
        safeSearch: 'strict'
      }).catch(error => {
        console.error('Backup search failed:', error);
        return null;
      });

      if (backupResponse?.data.items) {
        const backupVideos = backupResponse.data.items
          .filter(item => item.id?.videoId && item.snippet?.title)
          .map(item => ({
            title: item.snippet!.title!,
            videoId: item.id!.videoId!
          }));

        return [...scoredVideos, ...backupVideos].slice(0, maxResults);
      }
    }

    return scoredVideos.map(({ title, videoId }) => ({ title, videoId }));
  } catch (error) {
    console.error('YouTube API error:', error);
    if (error instanceof YouTubeAPIError) {
      throw error; // Re-throw API specific errors
    }
    return []; // Return empty array for other errors
  }
}