import express from 'express';
import cors from 'cors'; 
import authRouter from './routes'; 

const app = express();
const PORT = 5000; 

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/', authRouter); 

app.listen(PORT);