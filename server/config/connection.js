const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/tattoo-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'budget-app'
});

module.exports = mongoose.connection;