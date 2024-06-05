import axios from 'axios';

const API_KEY = 'AIzaSyAOK-tRkYR3k_sTs3aKm7W_Q3fJ1zWHZiY'; // Replace this with your YouTube API key
const CHANNEL_ID = '@viniproductionsofficial'; // Replace this with your channel ID

async function getChannelVideos(channelId) {
    let videoIds = [];
    let nextPageToken = '';

    do {
        const channelUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=20&pageToken=${nextPageToken}`;

        try {
            const response = await axios.get(channelUrl);
            const items = response.data.items;

            videoIds.push(
                ...items
                    .filter(item => item.id.kind === 'youtube#video')
                    .map(item => item.id.videoId)
            );

            nextPageToken = response.data.nextPageToken || '';
        } catch (error) {
            console.error('Error fetching channel videos:', error);
            break;
        }
    } while (nextPageToken);

    return videoIds;
}

async function getVideoDetails(videoIds) {
    let videoDetails = [];

    for (let i = 0; i < videoIds.length; i += 50) {
        const ids = videoIds.slice(i, i + 50).join(',');
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${ids}&part=snippet,contentDetails,statistics`;

        try {
            const response = await axios.get(videoDetailsUrl);
            videoDetails.push(
                ...response.data.items.map(item => ({
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnail: item.snippet.thumbnails.high.url
                }))
            );
        } catch (error) {
            console.error('Error fetching video details:', error);
            break;
        }
    }

    return videoDetails;
}

async function main() {
    const videoIds = await getChannelVideos(CHANNEL_ID);
    if (videoIds.length === 0) {
        console.log('No videos found for this channel.');
        return;
    }

    const videoDetails = await getVideoDetails(videoIds);
    console.log(videoDetails);
}

main();
