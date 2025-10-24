import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FootballFixtures() {
    const [matches, setMatches] = useState([]);
    const [category, setCategory] = useState('');
    const [scoreA, setScoreA] = useState({});
    const [scoreB, setScoreB] = useState({});
    const categories = ['U10 Boys', 'U13 Boys', 'U17 Boys', 'U14 Girls', 'Gents'];
    const [refreshKey, setRefreshKey] = useState(0);
    useEffect(() => {
        if (!category) return;
        axios
            .get(`http://localhost:5000/api/matches?sport=football&category=${category}`)
            .then(res => setMatches(res.data))
            .catch(err => console.error('Error fetching football fixtures:', err));
    }, [category, refreshKey]);
    return (
        <div>
            <h2>Football Fixtures</h2>

            <label>Select Category: </label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">-- Choose --</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            {matches.length === 0 ? (
                <p>No football matches found.</p>
            ) : (
                <table border="1" cellPadding="8" style={{ marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>Match No</th>
                            <th>Team A</th>
                            <th>Team B</th>
                            <th>Ground</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map(match => (
                            <tr key={match._id}>
                                <td>{match.matchNumber}</td>
                                <td>{match.teamA}</td>
                                <td>{match.teamB || 'TBD'}</td>
                                <td>{match.ground}</td>
                                <td>
                                    {match.result ? (
                                        `${match.result.teamA} - ${match.result.teamB}`
                                    ) : (
                                        <form onSubmit={e => {
                                            e.preventDefault();
                                            axios.post(`http://localhost:5000/api/matches/${match._id}/result`, {
                                                teamA: scoreA[match._id],
                                                teamB: scoreB[match._id]
                                            }).then(() => {
                                                //alert('Result saved!');
                                                //setCategory(category); // re-trigger fetch
                                                setRefreshKey(prev => prev + 1); // ✅ triggers re-fetch
                                            });
                                        }}>
                                            <input
                                                type="number"
                                                placeholder="A"
                                                value={scoreA[match._id] || ''}
                                                onChange={e => setScoreA({ ...scoreA, [match._id]: e.target.value })}
                                                style={{ width: '40px' }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="B"
                                                value={scoreB[match._id] || ''}
                                                onChange={e => setScoreB({ ...scoreB, [match._id]: e.target.value })}
                                                style={{ width: '40px' }}
                                            />
                                            <button type="submit">Save</button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FootballFixtures;
