
const express = require('express');
const { MongoClient,ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGO_URI;
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000','https://tonyarts-j21n9qz4k-guganhubs-projects.vercel.app'],
  credentials: true, 
}));
MongoClient.connect(uri)
    .then(client => {
        console.log('MongoDB connected');
        const db = client.db('TonyArts'); 

        app.post('/save-data', async (req, res) => {
            const { name ,email, password, gender,logindate , count} = req.body;
            
            try {
                await db.collection('UserFlow').insertOne({ name ,email , password,gender , logindate , count , role : "Customer"});
                res.status(201).json({ message: 'Data successfully' });
            } catch (err) {
                console.error('Error saving data:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        app.post('/get-all-user', async (req, res) => {
          const { name ,email, password, gender,logindate , count} = req.body;
          const collection = db.collection('UserFlow');
          try {
           
            const user = await collection.find({role:{ $ne: "Admin" } },{ projection: { password: 0 } }).toArray();
              res.status(201).json({ message: 'Data successfully' ,user:user });
          } catch (err) {
              console.error('Error saving data:', err);
              res.status(500).json({ error: 'Internal server error' });
          }
      });
        app.post('/get-data', async (req, res) => {

          const { name ,email, password} = req.body;
          const filter = {email:email,password:password};
          const currentDate = new Date();
       

const day = currentDate.getDate(); 
const month = currentDate.getMonth() + 1; 
const year = currentDate.getFullYear(); 
const formattedDate = `${day}/${month}/${year}`;
         
          // console.log(dateString);
          const update = { $inc: { count: 1 },$set: {logindate: formattedDate} };
          const options = { returnOriginal: false }; 
          const collection = db.collection('UserFlow');
            try {
              const user = await collection.findOne({email,password });
              await collection.findOneAndUpdate(filter, update, options);
              
              if (!user) {
                return res.status(404).json({ error: 'User not found' , user : user});
              }
              res.status(201).json({ message: 'Logged in successfully', user : user});
            } catch (error) {
              console.error('Error fetching user:', error);
              res.status(500).json({ error: 'Error fetching user' });
            }
          });
          

        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); 
    });
