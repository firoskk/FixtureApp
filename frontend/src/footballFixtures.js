import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FootballFixture = () => {
    const [matches, setMatches] = useState([]);
    const [category, setCategory] = useState('Gents');
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [editedScores, setEditedScores] = useState({ teamA: '', teamB: '' });

    useEffect(() => {
        if (!category) return;
        axios
            .get(`http://localhost:5000/api/matches?sport=football&category=${category}`)
            .then(res => setMatches(res.data))
            .catch(err => console.error('Error fetching football fixtures:', err));
    }, [category]);

    const handleSave = async (matchId) => {
        const teamAScore = Number(editedScores.teamA);
        const teamBScore = Number(editedScores.teamB);

        if (teamAScore < 0 || teamBScore < 0 || isNaN(teamAScore) || isNaN(teamBScore)) {
            alert('Scores must be positive numbers');
            return;
        }

        try {
            await axios.post(`http://localhost:5000/api/matches/${matchId}/result`, {
                teamA: teamAScore,
                teamB: teamBScore
            });
            //alert('Result saved!');
            setEditingMatchId(null);
            // Refresh matches
            axios
                .get(`http://localhost:5000/api/matches?sport=football&category=${category}`)
                .then(res => setMatches(res.data));
        } catch (err) {
            console.error('Error saving result:', err);
            alert('Failed to save result');
        }
    }
    return (
        <div>
            <h2>Football Fixtures - {category}</h2>
            <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="U10 Boys">U10 Boys</option>
                <option value="U13 Boys">U13 Boys</option>
                <option value="U17 Boys">U17 Boys</option>
                <option value="U14 Girls">Girls</option>
                <option value="Gents">Gents</option>
            </select>

            <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '70%' }}>
                <thead>
                    <tr>
                        <th>Match #</th>
                        <th>Team A</th>
                        <th>Team B</th>
                        {/*<th>Ground</th>*/}
                        <th>Result</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map(match => (
                        <tr key={match._id}>
                            <td>{match.matchNumber}</td>
                            <td>{match.teamA || 'TBD'}</td>
                            <td>{match.teamB || 'TBD'}</td>
                            {/*<td>{match.ground}</td>*/}
                            <td>
                                {editingMatchId === match._id ? (
                                    <>
                                        <input
                                            type="number"
                                            value={editedScores.teamA}
                                            onChange={e => setEditedScores({ ...editedScores, teamA: e.target.value })}
                                            placeholder="Team A score"
                                        />
                                        <input
                                            type="number"
                                            value={editedScores.teamB}
                                            onChange={e => setEditedScores({ ...editedScores, teamB: e.target.value })}
                                            placeholder="Team B score"
                                        />
                                        <button onClick={() => handleSave(match._id)}>Save</button>
                                        <button onClick={() => setEditingMatchId(null)}>Cancel</button>
                                        {/*<button onClick={() => handleReset(match._id)}>Reset</button>*/}
                                    </>
                                ) : (
                                    <>
                                        {match.result ? `${match.result.teamA} - ${match.result.teamB}`
                                            : 'Not yet played'
                                        }
                                        <button
                                            style={{ marginLeft: '10px' }}
                                            onClick={() => {
                                                setEditingMatchId(match._id);
                                                setEditedScores({
                                                    teamA: match.result?.teamA ?? '',
                                                    teamB: match.result?.teamB ?? ''
                                                });
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </>
                                )}
                            </td>
                            <td>
                                {match.result?.winner || 'TBD'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FootballFixture;