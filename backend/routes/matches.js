const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// GET matches with sport and category filtering
router.get('/', async (req, res) => {
    const { sport, category } = req.query;
    const filter = {};

    if (sport) filter.sport = new RegExp(`^${sport}$`, 'i');
    if (category) filter.category = new RegExp(`^${category}$`, 'i');

    try {
        const matches = await Match.find(filter);
        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).send('Error fetching matches');
    }
});

router.put('/:id/result', async (req, res) => {
    const { category, ground, teamA, teamB } = req.body;
    if (category !== 'U17 Boys' && category !== 'U14 Girls') {
        return res.status(400).json({ error: 'Invalid category for final match update' });
    }
    try {
        const match = await Match.findOne({ ground: 'final', category });

        if (!match) {
            return res.status(404).json({ error: 'Final match not found for this category' });
        }
        //console.log(`Finalist 1: ${teamA}, Finalist 2: ${teamB}`);
        match.teamA = teamA;
        match.teamB = teamB;
        await match.save();
        res.json({ message: 'Final match updated successfully', match });
    } catch (err) {
        console.error('Error updating final match:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST result and auto-generate next round
router.post('/:id/result', async (req, res) => {

    try {
        const { teamA, teamB } = req.body;
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).send('Match not found');

        const winner = teamA > teamB ? match.teamA : match.teamB;
        match.result = { teamA, teamB, winner };
        await match.save();

        // Find placeholder match with empty slots
        const progression = getCustomProgression({
            category: match.category,
            matchNumber: match.matchNumber
        });
        if (progression) {

            const target = await Match.findOne({
                sport: match.sport,
                category: match.category,
                matchNumber: progression.targetMatchNumber

            });

            if (target) {
                if (progression.assignTo === 'teamA') target.teamA = winner;
                else target.teamB = winner;
                await target.save();
                return res.send(`Winner assigned to match ${progression.targetMatchNumber} as ${progression.assignTo}`);
            }
        }

        res.send('Result saved and next round updated');
    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).send('Error saving result');
    }
});

module.exports = router;

function getCustomProgression({ category, matchNumber }) {

    if (category === 'U10 Boys') {
        if (matchNumber === 1) {
            return { targetMatchNumber: 3, assignTo: 'teamB' };
        }
        if (matchNumber === 2) {
            return { targetMatchNumber: 4, assignTo: 'teamB' };
        }
        if (matchNumber === 3) {
            return { targetMatchNumber: 5, assignTo: 'teamA' };
        }
        if (matchNumber === 4) {
            return { targetMatchNumber: 5, assignTo: 'teamB' };
        }
    }
    if (category === 'U13 Boys') {
        if (matchNumber === 1) {
            return { targetMatchNumber: 4, assignTo: 'teamB' };
        }
        if (matchNumber === 2) {
            return { targetMatchNumber: 5, assignTo: 'teamA' };
        }
        if (matchNumber === 3) {
            return { targetMatchNumber: 5, assignTo: 'teamB' };
        }
        if (matchNumber === 4) {
            return { targetMatchNumber: 6, assignTo: 'teamA' };
        }
        if (matchNumber === 5) {
            return { targetMatchNumber: 6, assignTo: 'teamB' };
        }
    }
    if (category === 'Gents') {
        if (matchNumber === 1) {
            return { targetMatchNumber: 3, assignTo: 'teamB' };
        }
        if (matchNumber === 2) {
            return { targetMatchNumber: 4, assignTo: 'teamA' };
        }
        if (matchNumber === 3) {
            return { targetMatchNumber: 4, assignTo: 'teamB' };
        }
    }
    return null;
}
