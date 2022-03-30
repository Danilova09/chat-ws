const mongoose = require('mongoose');
const config = require('./config');
const User = require('./models/User');

const run = async () => {
    await mongoose.connect(config.mongo.db, config.mongo.options);

    const collections = await mongoose.connection.db.listCollections().toArray();

    for (const coll of collections) {
        await mongoose.connection.db.dropCollection(coll.name);
    }

    await User.create({
        displayName: 'user',
        email: 'user@gmail.com',
        password: 'user',
        token: 'user',
        role: 'user'
    }, {
        displayName: 'admin',
        email: 'admin@gmail.com',
        password: 'admin',
        token: 'admin',
        role: 'admin',
    });

    await mongoose.connection.close();
}

run().catch((e) => console.log(e));