const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('mongodb')

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
        const bookingsCollection = db.collection('bookings')


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
        app.get('/tutors/:id', async (req, res) => {
            const tutor = await tutorsCollection.findOne({ _id: new ObjectId(req.params.id) })
            res.send(tutor)
        })
        // Save booking
        app.post('/bookings', async (req, res) => {
            try {
                const booking = req.body

                const result = await bookingsCollection.insertOne({
                    ...booking,
                    createdAt: new Date()
                })

                res.status(201).json(result)
            } catch (error) {
                console.error("Booking error:", error)
                res.status(500).json({ error: "Failed to create booking" })
            }
        })

        // Decrease slot
        app.patch('/tutors/:id/decrease-slot', async (req, res) => {
            try {

                const result = await tutorsCollection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $inc: { totalSlot: -1 } }
                )

                if (result.modifiedCount === 0) {
                    return res.status(404).json({ error: "Tutor not found" })
                }

                res.json(result)
            } catch (error) {
                console.error("Decrease slot error:", error)
                res.status(500).json({ error: "Failed to update slot" })
            }
        })
        // Save new tutor profile
        app.post('/tutors', async (req, res) => {
            try {
                const tutorData = req.body

                // Add a timestamp and ensure numeric fields are properly formatted
                const newTutor = {
                    ...tutorData,
                    totalSlots: parseInt(tutorData.totalSlots) || 0,
                    hourlyRate: parseFloat(tutorData.hourlyRate) || 0,
                    experience: parseInt(tutorData.experience) || 0,
                    createdAt: new Date(),
                    // If you want to use the 'registeredAt' field for your existing search filter:
                    registeredAt: new Date().toISOString() 
                }

                const result = await tutorsCollection.insertOne(newTutor)

                res.status(201).json({
                    success: true,
                    message: "Tutor profile created successfully",
                    data: result
                })
            } catch (error) {
                console.error("Create tutor error:", error)
                res.status(500).json({ error: "Failed to create tutor profile" })
            }
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