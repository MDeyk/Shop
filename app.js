const express = require("express");
const app = express();
const morgan = require("morgan"); 
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose");

const clientRoutes = require("./api/routes/clients");
const productRoutes = require("./api/routes/products");
const sellerRoutes = require("./api/routes/sellers");
const TransactionRoutes = require("./api/routes/transactions");
const userRoutes = require("./api/routes/users");

mongoose.connect("mongodb+srv://user:"+process.env.MONGO_PASS+"@cluster0-jmpzx.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true});

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/clients', clientRoutes);
app.use("/products",productRoutes);
app.use('/sellers', sellerRoutes);
app.use('/transactions', TransactionRoutes);
app.use('/users', userRoutes);

app.use((req,res,next)=> {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500).json({error: error.message})
}); 

module.exports = app;
