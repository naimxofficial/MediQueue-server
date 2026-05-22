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
        const myTutorsCollection = db.collection('myTutors')


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
        app.post('/my-tutors', async (req, res) => {
            try {
                const { totalSlot, hourlyRate, experience, ...rest } = req.body

                const newTutor = {
                    ...rest,
                    totalSlot: parseInt(totalSlot) || 0,
                    hourlyRate: parseFloat(hourlyRate) || 0,
                    experience: parseInt(experience) || 0,
                    createdAt: new Date(),
                    registeredAt: new Date().toISOString()
                }

                const result = await myTutorsCollection.insertOne(newTutor)

                res.status(201).json({
                    success: true,
                    message: "Tutor added to your list",
                    data: result
                })
            } catch (error) {
                res.status(500).json({ error: "Failed to add tutor" })
            }
        })
        app.get('/my-tutors', async (req, res) => {
            try {
                const userId = req.user?.id;
                const myTutors = await myTutorsCollection.find({ userId })
                    .sort({ createdAt: -1 })
                    .toArray();

                res.send(myTutors);
            } catch (error) {
                console.error("Error fetching my tutors:", error);
                res.status(500).json({ error: "Failed to fetch tutors" });
            }
        });


        // DELETE a tutor
        app.delete('/my-tutors/:id', async (req, res) => {
            try {
                const result = await myTutorsCollection.deleteOne({
                    _id: new ObjectId(req.params.id)
                });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ error: "Tutor not found" });
                }

                res.json({ success: true, message: "Tutor deleted successfully" });
            } catch (error) {
                console.error("Delete error:", error);
                res.status(500).json({ error: "Failed to delete tutor" });
            }
        });

        // UPDATE a tutor
        app.put('/my-tutors/:id', async (req, res) => {
            try {
                const { _id, createdAt, ...updateData } = req.body;

                const processedData = {
                    ...updateData,
                    totalSlot: parseInt(updateData.totalSlot) || 0,
                    hourlyRate: parseFloat(updateData.hourlyRate) || 0,
                    experience: parseInt(updateData.experience) || 0,
                    updatedAt: new Date()
                };

                const result = await myTutorsCollection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: processedData }
                );

                if (result.modifiedCount === 0) {
                    return res.status(404).json({ error: "Tutor not found or no changes made" });
                }

                res.json({ success: true, message: "Tutor updated successfully" });
            } catch (error) {
                console.error("Update error:", error);
                res.status(500).json({ error: "Failed to update tutor" });
            }
        });

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