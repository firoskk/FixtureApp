import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/matches')
            .then(res => setMatches(res.data));
    }, []);

    return (
        <div className="App">
            <h1>Tournament Fixtures</h1>
            {matches.map(match => (
                <div key={match._id} className="match-card">
                    <h3>{match.sport} - {match.category} - Round {match.round}</h3>
                    <p>{match.teamA} vs {match.teamB}</p>
                    <p>Ground: {match.ground}</p>
                    <p>Time: {new Date(match.time).toLocaleString()}</p>
                    {match.result ? (
                        <p>Result: {match.result.winner} won ({match.result.score})</p>
                    ) : (
                        <p>Result: Pending</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default App;
