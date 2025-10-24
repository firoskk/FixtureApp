import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FootballFixtures from './footballFixtures';
import BadmintonFixtures from './badmintonFixtures';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Meraki25 Fixtures</h1>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/football" element={<FootballFixtures />} />
          <Route path="/badminton" element={<BadmintonFixtures />} />
        </Routes>
      </div>
    </Router>
  );
}

function LandingPage() {
  return (
    <div className="landing">
      <h2>Select The Game</h2>
      <Link to="/football"><button>Football Fixtures</button></Link>
      <Link to="/badminton"><button>Badminton Fixtures</button></Link>
    </div>
  );
}

export default App;