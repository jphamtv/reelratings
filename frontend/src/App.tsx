import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ClientCacheProvider } from './context/ClientCacheContext';
import { SearchProvider } from './context/SearchContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailsPage from './pages/DetailsPage';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ClientCacheProvider>
        <SearchProvider>
          <ThemeProvider>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route element={<Layout />}>
                <Route path='/search' element={<SearchPage />} />
                <Route path='/details/:tmdbId/:mediaType' element={<DetailsPage />} />
              </Route>
            </Routes>
          </ThemeProvider>
        </SearchProvider>
      </ClientCacheProvider>
    </HelmetProvider>
  );
};

export default App;
