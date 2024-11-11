import express from 'express';
const app = express();
import cors from 'cors';
// import body-parser from 'bodyParser'
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import authUser from './modules/authUsers/router';

const Port = process.env.PORT || 2000;

// MongoDB connection
const uri = process.env.MONGODB_URI as string;
mongoose
  .connect(uri)
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((error) => {
    console.error('Error connecting to DB:', error);
  });

// middleware
app.use(cors());
app.use(express.json());
// app.use(bodyParder())

// routes
app.use('/api', authUser);

app.listen(Port, () => {
  console.log('connected');
});
