import React from 'react';
import logo from './logo.png';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FootballFixtures from './footballFixtures';
import BadmintonFixtures from './badmintonFixtures';
//import './App.css';

<img src={logo} alt="App Logo" />

function App() {
  return (
    <Router>
      <div className="App">
        <h1 style={{ textAlign: "left" }}>Meraki25 Schedule</h1>
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
      <img src="/logo.png" alt="App Logo" className="logo" />
      <h3>Select The Game</h3>
      <Link to="/football"><button>Football</button></Link>
      <Link to="/badminton"><button>Badminton</button></Link>
    </div>
  );
}

export default App;