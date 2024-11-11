import express from 'express';
const app = express();
import cors from 'cors';
// import body-parser from 'bodyParser'
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import authUser from './src/modules/authUsers/router';
import bodyParser from 'body-parser';

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
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// routes
app.use('/api', authUser);

// app.listen(Port, () => {
//   console.log('connected');
// });

export default app;
