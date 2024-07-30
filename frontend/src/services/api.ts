const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const fetchTrendingMovies = async () => {
  const response = await fetch(`${API_BASE_URL}/trending`);
  if (!response.ok)
    throw new Error(
      `Failed to fetch trending movies. Status: ${response.status}`,
    );
  return await response.json();
};

export const searchTitle = async (query: string) => {
  const response = await fetch(
    `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`,
  );
  if (!response.ok)
    throw new Error(
      `Failed to fetch search results. Status: ${response.status}`,
    );
  return await response.json();
};

export const fetchDirectorMovies = async (directorId: string) => {
  const response = await fetch(`${API_BASE_URL}/director/${directorId}`);
  if (!response.ok)
    throw new Error(
      `Failed to fetch director movies. Status: ${response.status}`,
    );
  return await response.json();
};

export const fetchTitleDetails = async (tmdbId: string, mediaType: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/details/${tmdbId}/${mediaType}`,
    );
    if (!response.ok)
      throw new Error(
        `Failed to fetch title details. Status: ${response.status}`,
      );
    return await response.json();
  } catch (error) {
    console.error("Error fetching title details:", error);
    throw error;
  }
};
