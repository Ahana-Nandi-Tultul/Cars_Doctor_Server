const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.epxwefd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollection = client.db('carsDoctor').collection('services');
    const bookingsCollection = client.db('carsDoctor').collection('bookings');

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({token});
    })

    app.get('/services', async(req, res) => {
        const cursor = servicesCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
            projection: { title: 1, service_id: 1, img:1, price: 1}
        };
        const result = await servicesCollection.findOne(query, options);
        res.send(result);
    })

    app.get('/bookings', async(req, res) => {
        // console.log(req.query.email);
        let query = {};
        if(req.query?.email){
            query = {email: req.query.email}
        }

        const result = await bookingsCollection.find(query).toArray();
        res.send(result);
    })

    app.patch('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedStatus = req.body;
      const booking = {
          $set: {
            status: updatedStatus.status
          }
      };
      const result = await bookingsCollection.updateOne(filter, booking)
      res.send(result);
    })

    app.post('/booking', async(req, res) => {
        const bookService = req.body;
        const result = await bookingsCollection.insertOne(bookService);
        res.send(result);
    })

    app.delete('/booking/:id',  async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Doctor is running');
});

app.listen(port, () => {
    console.log('Car doctor is listening to port: ', port);
})