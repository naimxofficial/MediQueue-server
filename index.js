const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config()
const uri = process.env.MONGODB_URI

const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        const db = client.db('mediqueue')
        const tutorsCollection = db.collection('tutors')


        // Get 6 tutors for home page
        app.get('/featured', async (req, res) => {
            const tutors = await tutorsCollection.aggregate([{ $limit: 6 }]).toArray()
            res.send(tutors)
        })

        app.get('/tutors', async (req, res) => {
            const { search, startDate, endDate } = req.query
            const query = {}

            if (search) {
                query.name = { $regex: search, $options: 'i' }
            }
            if (startDate || endDate) {
                query.registeredAt = {}
                if (startDate) query.registeredAt.$gte = startDate
                if (endDate) query.registeredAt.$lte = endDate
            }

            const tutors = await tutorsCollection.find(query).toArray()
            res.send(tutors)
        })


    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})