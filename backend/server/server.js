const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const matchRoutes = require('./routes/matches');
//const Match = require('./models/Match'); 
const app = express();
app.use(cors());
app.use(express.json());
const seedFixtures = require('./routes/seedFixtures');
app.use('/', seedFixtures);

//mongoose.connect('mongodb+srv://firoskk_db_user:vcAWCf88VwHjwdD4@mycluster.3dyl5nf.mongodb.net/?retryWrites=true&w=majority&appName=mycluster')
//app.use('/api/matches', matchRoutes);
mongoose
    .connect('mongodb+srv://firoskk_db_user:vcAWCf88VwHjwdD4@mycluster.3dyl5nf.mongodb.net/?retryWrites=true&w=majority&appName=mycluster')
    .then(async () => {
        console.log('MongoDB connected');

        // await patchMatchNumbers(); 

        app.use('/api/matches', matchRoutes);
        app.listen(5000, () => console.log('Server running on port 5000'));
    })
    .catch(err => console.error('MongoDB connection error:', err));

//app.listen(5000, () => console.log('Server running on port 5000'));

//This is temp code to patch up the database - whenever there is a schema changes.
async function patchMatchNumbers() {
    const matches = await Match.find({ sport: 'football' }); //, category: 'Gents' }).sort({ round: 1 });

    for (let i = 0; i < matches.length; i++) {
        matches[i].matchNumber = i + 1;
        await matches[i].save();
        console.log(`Updated match ${matches[i]._id} with matchNumber ${i + 1}`);
    }

    mongoose.disconnect();
}
