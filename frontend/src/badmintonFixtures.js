import React, { useEffect, useState } from 'react';
import axios from 'axios';

function BadmintonFixtures() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/matches?sport=badminton')
            .then(res => setMatches(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2>Badminton Fixtures</h2>
            {matches.length === 0 ? (
                <p>No Badminton matches found.</p>
            ) : (
                matches.map(match => (
                    <div key={match._id}>
                        <p>{match.teamA} vs {match.teamB}</p>
                        <p>Round {match.round} - {match.ground}</p>
                        <p>{new Date(match.time).toLocaleString()}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default BadmintonFixtures;