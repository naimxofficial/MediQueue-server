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

        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
        const db = client.db('mediqueue')
        const tutorsCollection = db.collection('tutors')

        app.get('/tutors', async (req, res) => {
            const tutors = await tutorsCollection.find().toArray()
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
