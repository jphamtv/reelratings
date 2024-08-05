import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ClientCacheProvider } from "../context/ClientCacheContext";
import { SearchProvider } from "../context/SearchContext";
import App from "../App";

vi.stubGlobal("scrollTo", vi.fn());

const mockGetItem = vi.fn();
const mockSetItem = vi.fn();

vi.mock("../hooks/useClientCache", () => ({
  useClientCache: () => ({
    getItem: mockGetItem,
    setItem: mockSetItem,
  }),
}));

// Mock the API calls
vi.mock("../services/api", () => ({
  fetchTrendingMovies: vi.fn(() =>
    Promise.resolve({
      results: [
        {
          tmdb_id: 1,
          title: "Test Movie",
          year: "2023",
          media_type: "movie",
          poster_img: "test-url",
        },
      ],
    }),
  ),
  searchTitle: vi.fn(() =>
    Promise.resolve({
      results: [
        {
          id: 1,
          tmdb_id: 1,
          title: "Inception",
          year: "2010",
          media_type: "movie",
          poster_img: "inception-url",
        },
      ],
    }),
  ),
  fetchTitleDetails: vi.fn(() =>
    Promise.resolve({
      tmdb_data: {
        id: 1,
        tmdb_id: 1,
        title: "Inception",
        year: "2010",
        media_type: "movie",
        poster_img: "inception-url",
        director: [{ id: 525, name: "Christopher Nolan" }],
        runtime: "2h 28m",
        certification: "PG-13",
      },
      external_data: {
        imdb_url: "https://www.imdb.com/title/tt1375666/",
        imdb_rating: "8.8",
        rottentomatoes_url: "https://www.rottentomatoes.com/m/inception",
        rottentomatoes_scores: {
          tomatometer: 87,
          audience_score: 91,
        },
      },
    }),
  ),
}));

const renderApp = () =>
  render(
    <BrowserRouter>
      <ClientCacheProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </ClientCacheProvider>
    </BrowserRouter>,
  );

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders homepage with search bar", async () => {
    renderApp();
    const searchInput =
      await screen.findByPlaceholderText("Search Movies & TV Shows");
    expect(searchInput).toBeInTheDocument();
  });

  it("can navigate to search page", async () => {
    renderApp();
    const searchInput =
      await screen.findByPlaceholderText("Search Movies & TV Shows");
    fireEvent.change(searchInput, { target: { value: "Inception" } });
    fireEvent.submit(searchInput);

    await waitFor(() => {
      expect(screen.getByText(/Search results for/)).toBeInTheDocument();
    });
  });

  it("can fetch and display title details", async () => {
    const { fetchTitleDetails } = await import("../services/api");
    renderApp();

    // First, perform a search
    const searchInput =
      await screen.findByPlaceholderText("Search Movies & TV Shows");
    fireEvent.change(searchInput, { target: { value: "Inception" } });
    fireEvent.submit(searchInput);

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText(/Search results for/)).toBeInTheDocument();
    });

    // Find and click on the search result item
    const searchResultItem = await screen.findByText("Inception");
    fireEvent.click(searchResultItem);

    // Wait for the details to be fetched
    await waitFor(() => {
      expect(fetchTitleDetails).toHaveBeenCalled();
    });

    // Check for some details from the mocked data
    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(await screen.findByText(/2010/)).toBeInTheDocument();
    expect(await screen.findByText("Christopher Nolan")).toBeInTheDocument();
  });
});
