import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DetailsPage from './pages/DetailsPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route element={<Layout />}>
          <Route path='/search' element={<SearchPage />} />
          <Route path='/details/:id/:mediaType' element={<DetailsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
