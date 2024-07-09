const API_BASE_URL = 'http://localhost:8000/api'; // Adjust to API URL later

export const searchTitles = async (query: string) => {
  const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
  if (!response) throw new Error('Search failed');
  
  return response.json();
}

export const getTitleDetails = async (tmdbId: string, mediaType: string) => {
  const response = await fetch(`${API_BASE_URL}/details/${tmdbId}/${mediaType}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  return response.json();
}