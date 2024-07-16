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
  const response = await fetch(`${API_BASE_URL}/details/${tmdbId}/${mediaType}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  return response.json();
}