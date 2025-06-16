import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import BrevEduPlus from './pages/BrevEduPlus';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-primary text-white">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/brevedu-plus" element={<BrevEduPlus />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;