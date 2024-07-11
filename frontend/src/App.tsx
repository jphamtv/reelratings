import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ClientCacheProvider } from './context/ClientCacheContext';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailsPage from './pages/DetailsPage';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ClientCacheProvider>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route element={<Layout />}>
            <Route path='/search' element={<SearchPage />} />
            <Route path='/details/:tmdbId/:mediaType' element={<DetailsPage />} />
          </Route>
        </Routes>
      </ClientCacheProvider>
    </HelmetProvider>
  );
};

export default App;
