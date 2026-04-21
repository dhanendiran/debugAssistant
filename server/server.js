const express=require('express')
const dotenv=require('dotenv')
const cors=require('cors')
const debugrou=require("./routes/debugroute")
require("dotenv").config();
const connectDB = require("./config/db");
const app=express()
import cors from "cors";

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json())
app.use('/api',debugrou)
app.get('/',(req,res)=>{
    res.send("Api is running")
})
const port=process.env.Port || 8080
connectDB()
app.listen(port,()=>{
    console.log(`server is running ${port}`)
})