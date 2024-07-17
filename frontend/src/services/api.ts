const API_BASE_URL = 'http://localhost:8000/api'; // Adjust to API URL later

export const fetchTrendingMovies = async () => {
  const response = await fetch(`${API_BASE_URL}/trending`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  return response.json();
}

export const searchTitle = async (query: string) => {
  const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  return response.json();
}

export const fetchDirectorMovies = async (directorId: string) => {
  const response = await fetch(`${API_BASE_URL}/director/${directorId}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  return response.json();
}

export const fetchTitleDetails = async (tmdbId: string, mediaType: string) => {
  // First, try to fetch from cache
  const cacheResponse = await fetch(`${API_BASE_URL}/cache/details/${tmdbId}/${mediaType}`)

  if (cacheResponse.ok) {
    return cacheResponse.json();
  }

  // If not in cache, fetch from the original API
  const apiResponse = await fetch(`${API_BASE_URL}/details/${tmdbId}/${mediaType}`);

  if (!apiResponse.ok) throw new Error(`HTTP error! status: ${apiResponse.status}`);
  
  return apiResponse.json();
}