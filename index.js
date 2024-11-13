const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:5173',  // Allow the frontend origin
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Espresso emporium server is running.");
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clustermuntasir.bwzlexy.mongodb.net/?retryWrites=true&w=majority&appName=clusterMuntasir`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const coffeeDB = client.db('CoffeeDB');
const coffeeCollection = coffeeDB.collection('coffeeCollection');
const comments = coffeeDB.collection('comments');
const users = coffeeDB.collection('users');


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //get all coffees
    app.get('/coffees', async (req, res) => {
      const result = await coffeeCollection.find().toArray();
      res.send(result);
    })

    //get single coffees
    app.get('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const result = await coffeeCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    })

    //upload single coffee
    app.post('/coffee', async (req, res) => {
      const coffee = req.body;
      const result = await coffeeCollection.insertOne(coffee);
      res.send(result);
    })

    //upload multiple coffee
    app.post('/coffees', async (req, res) => {
      const coffee = req.body;
      const result = await coffeeCollection.insertMany(coffee);
      res.send(result);
    })

    //update single coffee
    app.put('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const { name, chef, supplier, taste, category, details, photoURL } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const updatedCoffee = { $set: { name, chef, supplier, taste, category, details, photoURL } }
      const result = await coffeeCollection.updateOne(filter, updatedCoffee, options);
      res.send(result);
    })

    //delete a coffee
    app.delete('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    })

    //get all users
    app.get('/users', async (req, res) => {
      const result = await users.find().toArray();
      res.send(result);
    })

    // post user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.send(result);
    })

    // update user after login
    app.put('/users', async (req, res) => {
      const { uid, email, displayName, emailVerified, isAnonymous, providerId, createdAt, lastLoginAt, photoURL, password } = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedUser = {
        $set: { uid, email, displayName, emailVerified, isAnonymous, providerId, createdAt, lastLoginAt, photoURL, password }
      }
      const result = await users.updateOne(filter, updatedUser, options);
      res.send(result);
    })

    // delete user
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const result = await users.deleteOne({ _id: new ObjectId(id) })
      res.send(result);
    })

    //post comment
    app.post('/comment', async (req, res) => {
      const comment = req.body;
      const result = await comments.insertOne(comment);
      res.send(result);
    })

    //get all comments
    app.get('/comments', async (req, res) => {
      const result = await comments.find().toArray();
      res.send(result);
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log("This server is running in the port no: " + port);
});