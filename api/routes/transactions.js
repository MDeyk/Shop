const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const Transaction = require('../models/transaction');
const Product = require('../models/product');
const Client = require('../models/client');


router.get('/', checkAuth, (req,res,next)=>{
    Transaction.find()
    .select('product client date _id')
    .populate('product', 'name price')
    .populate('client','name surname email')
    .exec()
    .then(docs =>{
        res.status(200).json({
            count: docs.length,
            transactions: docs.map(doc=>{
                return{
                    _id: doc._id,
                    product: doc.product,
                    client: doc.client,
                    date: doc.date,
                    request:{
                        type:'GET',
                        url: 'http://localhost:3000/transactions/' + doc._id
                    }
                }
            }),
            
        });
    })
    .catch(err =>{
        res.status(500).json(err);
    });
});

router.get('/:transactionId', checkAuth, (req,res,next)=>{
    Transaction.findById(req.params.transactionId)
    .select('product name price _id')
    .populate('product', 'name price')
    .select('client name surname email')
    .populate('client', 'name surname email')
    .exec()
    .then(transaction=>{
        if(!transaction){
            return res.status(404).json({message: 'Nie ma takiej tranzakcji'});
        }
        res.status(200).json({
            transaction: transaction,
            request:{
                type: 'GET',
                url: 'http://localhost:3000/transactions/'
            }              
        });
    })
    .catch(err =>{
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', checkAuth, (req,res,next)=>{
    const transaction = new Transaction({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.product,
        client: req.body.client,
        date: req.body.date
    });
    Client.findById(req.body.client).exec()
    .then(client=>{
        if(!client){
            return res.status(404).json({
                message: 'Klient nie znaleziony'
            });
        }
        Product.findById(req.body.product)
            .then(product =>{
            if(!product){
                return res.status(404).json({
                    message: 'Produkt nie znaleziony'
                });
            }
            transaction.save()
                .then(result =>{
                    console.log(result);
                    res.status(201).json({
                        message: 'Dodano sprzedaż',
                        createdTransaction:{
                            _id: result._id,
                            product: result.product,
                            client: result.client,
                            date: result.date
                            },
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/transactions/' + result._id
                            }
                        });
                    });   
                })
            })
        .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});  

router.delete('/:transactionId', checkAuth, (req,res,next)=>{
    Transaction.findById({_id: req.params.transactionId})
    .exec()
    .then(result=>{
        if(!result){
            return res.status(404).json({
                message: 'Nie ma takiej tranzakcji'
            });
        }
        Transaction.remove({_id: req.params.transactionId})
        .exec()
        .then(result=>{
            res.status(200).json({
                message: 'Usunięto tranzakcje',
                request:{
                    type:'POST',
                    url: 'http://localhost:3000/transactions/',
                    body: {productId: "ID", date: 'Date'}
                }
            })
        })
    })
    .catch(err=>{
        res.status(err).json({
            error: err
        });
    });
});

module.exports = router;