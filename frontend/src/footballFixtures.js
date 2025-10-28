import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'

const FootballFixture = () => {
    const [matches, setMatches] = useState([]);
    const [category, setCategory] = useState('U10 Boys');
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [editedScores, setEditedScores] = useState({ teamA: '', teamB: '' });
    //Points.
    const [pointsTable, setPointsTable] = useState([]);
    const [view, setView] = useState('fixtures'); // 'fixtures' or 'points'
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    console.log(`Base URL : ${baseURL}`);
    useEffect(() => {
        if (!category) return;
        console.log(` L1 Just before GET Base URL : ${baseURL}`);
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/matches?sport=football&category=${category}`)
            .then(res => {
                setMatches(res.data);
                //if ((view === 'points') && (category === 'U17 Boys' || category === 'U14 Girls')) {
                    const stats = computePointsTable(res.data);
                    setPointsTable(stats);
                //}
                console.log(`L2 After GET before map Category : ${category}`);
               
                if (matches.length > 0) {
                    matches.forEach(match => {
                        console.log(`L3(after state update) Category: ${match.category}`);
                    });
                }
                else
                {
                    res.data.forEach(match => {
                    console.log(`Length is 0 : L3 Category: ${match.category}`);
                    });
                }

            })
            .catch(err => {
                console.error('Failed to fetch matches:', err);
                setMatches([]);
                setPointsTable([]);
            })

    }, [category, view]);

    const handleSave = async (matchId) => {
        const teamAScore = Number(editedScores.teamA);
        const teamBScore = Number(editedScores.teamB);

        if (teamAScore < 0 || teamBScore < 0 || isNaN(teamAScore) || isNaN(teamBScore)) {
            alert('Scores must be positive numbers');
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/matches/${matchId}/result`, {
                teamA: teamAScore,
                teamB: teamBScore
            });
            setEditingMatchId(null);
            // Refresh matches
            axios
                .get(`${process.env.REACT_APP_API_BASE_URL}/api/matches?sport=football&category=${category}`)
                .then(async res => {
                    setMatches(res.data);
                    if (category === "U17 Boys" || category === "U14 Girls") {
                        const stats = computePointsTable(res.data);
                        setPointsTable(stats);
                        const allMatchesPlayed = res.data
                            .filter(match => match.ground !== 'final') // exclude final
                            .every(match => match.result && match.result.teamA != null && match.result.teamB != null);

                        if (allMatchesPlayed) {
                            console.log("..####.All matches played ..###..");
                            const finalMatch = res.data.find(m => m.ground === 'final');
                            const finalists = stats.slice(0, 2); // top 2 teams
                            if (!finalMatch) {
                                console.warn("Final match not found.");
                                return;
                            }
                            const [teamA, teamB] = [finalists[0].team, finalists[1].team];
                            console.log(`Final team :${teamA} & ${teamB}`);
                            try {
                                await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/matches/${finalMatch._id}/result`, {
                                    teamA,
                                    teamB,
                                    category: finalMatch.category,
                                    ground: finalMatch.ground
                                });
                                //Now re-fetch updated matches
                                const updated = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/matches?sport=football&category=${category}`);
                                setMatches(updated.data);
                                setPointsTable(computePointsTable(updated.data));
                            }
                            catch (err) {
                                console.error('Failed to assign finalists:', err);
                            }
                        }
                    }
                })
        }
        catch (err) {
            console.error('Error saving result:', err);
            alert('Failed to save result');
        }
    };
    return (
        <div>
            <div className="select-wrapper">
                <select value={view} onChange={e => setView(e.target.value)}>
                    <option value="fixtures">Fixtures</option>
                    <option value="points">Points Table</option>
                </select>

                {/*<h2> Team Category - {category}</h2>*/}
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="U10 Boys">U10 Boys</option>
                    <option value="U13 Boys">U13 Boys</option>
                    <option value="U17 Boys">U17 Boys</option>
                    <option value="U14 Girls">U14 Girls</option>
                    <option value="Gents">Gents</option>
                </select>
            </div>
            {view === 'fixtures' ? (
                <>
                    <h2>Football Fixtures - {category}</h2>
                    <table className="match-table">
                        <thead>
                            <tr>
                                <th>Match #</th>
                                <th>Team A</th>
                                <th>Team B</th>
                                <th>Result</th>
                                <th>Winner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map(match => {
                                const winner = match.result?.winner ?? 'TBD';
                                const resultText = match.result ? `${match.result.teamA} - ${match.result.teamB}` : 'Not yet played';

                                return (
                                    <tr key={match._id}>
                                        <td>{match.matchNumber}</td>
                                        <td>{match.teamA || 'TBD'}</td>
                                        <td>{match.teamB || 'TBD'}</td>
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
                                                </>
                                            ) : (
                                                <>
                                                    {resultText}
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
                                            {winner !== 'TBD' ? (
                                                match.ground === 'final' ? (
                                                    <div className="winner-top">
                                                        <div className="flashing-winner">🏆 Winner: {winner}</div>
                                                    </div>
                                                ) : (
                                                    <span>{winner}</span>
                                                )
                                            ) : (
                                                <span>TBD</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>

            ) : (
                category === "U17 Boys" || category === "U14 Girls" ? (
                    <>
                        <h2>Points Table - {category}</h2>
                        <table className="match-table">
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th>Played</th>
                                    <th>Won</th>
                                    <th>Lost</th>
                                    <th>Draw</th>
                                    <th>GF</th>
                                    <th>GA</th>
                                    <th>GD</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsTable.map(team => (
                                    <tr key={team.team}>
                                        <td>{team.team}</td>
                                        <td>{team.played}</td>
                                        <td>{team.won}</td>
                                        <td>{team.lost}</td>
                                        <td>{team.draw}</td>
                                        <td>{team.gf}</td>
                                        <td>{team.ga}</td>
                                        <td>{team.gd}</td>
                                        <td>{team.pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p>Points table not available for this category.</p>
                )
            )
            }
        </div >
    );

    function computePointsTable(matches) {
        const stats = {};

        for (const match of matches) {
            const { teamA, teamB, result } = match;
            [teamA, teamB].forEach(team => {
                if (!team || typeof team !== 'string' || team.trim() === '') return; // skip invalid names
                if (!stats[team]) {
                    stats[team] = {
                        team,
                        played: 0,
                        won: 0,
                        lost: 0,
                        draw: 0,
                        gf: 0,
                        ga: 0,
                        gd: 0,
                        pts: 0
                    };
                }
            });

            if (result && result.teamA != null && result.teamB != null && match.ground != `final`) {
                stats[teamA].played += 1;
                stats[teamB].played += 1;
                stats[teamA].gf += result.teamA;
                stats[teamA].ga += result.teamB;
                stats[teamB].gf += result.teamB;
                stats[teamB].ga += result.teamA;

                if (result.teamA > result.teamB) {
                    stats[teamA].won += 1;
                    stats[teamB].lost += 1;
                    stats[teamA].pts += 3;
                } else if (result.teamA < result.teamB) {
                    stats[teamB].won += 1;
                    stats[teamA].lost += 1;
                    stats[teamB].pts += 3;
                } else {
                    stats[teamA].draw += 1;
                    stats[teamB].draw += 1;
                    stats[teamA].pts += 1;
                    stats[teamB].pts += 1;
                }

                stats[teamA].gd = stats[teamA].gf - stats[teamA].ga;
                stats[teamB].gd = stats[teamB].gf - stats[teamB].ga;
            }
        }
        return Object.values(stats).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            if (b.gd !== a.gd) return b.gd - a.gd;
            return b.gf - a.gf;
        });
    }
}

export default FootballFixture;







