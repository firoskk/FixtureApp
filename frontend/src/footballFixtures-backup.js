import React, { useEffect, useState } from 'react';
import axios from 'axios';



function FootballFixtures() {
    const [matches, setMatches] = useState([]);
    const [category, setCategory] = useState('');
    const categories = ['U10 Boys', 'U13 Boys', 'U17 Boys', 'U14 Girls', 'Gents'];

    /*
        useEffect(() => {
            axios.get('http://localhost:5000/api/matches?sport=football')
                .then(res => setMatches(res.data))
                .catch(err => console.error('Error fetching football fixtures:', err));
        }, []);
    */
    <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
        ))}
    </select>
    useEffect(() => {
        if (!category) return;
        axios.get(`http://localhost:5000/api/matches?sport=football&category=${category}`)
            .then(res => setMatches(res.data))
            .catch(err => console.error(err));
    }, [category]);

    return (
        <div>
            <h2>Football Fixtures</h2>
            {matches.length === 0 ? (
                <p>No football matches found.</p>
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
export default FootballFixtures;