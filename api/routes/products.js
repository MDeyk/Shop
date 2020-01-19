const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const Product = require('../models/product');

router.get('/', (req, res, next)=>{
    Product.find()
    .select('name price _id')
    .exec()
    .then(docs =>{
        const response = {
            Message: "Lista Wszystkich Produktów",
            count: docs.length,
            products: docs.map(doc =>{
                return{
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/products/'+doc._id
                        }
                    }
                }
            })
        };
        res.status(200).json(response);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.post('/', checkAuth, (req, res, next)=>{
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    Product.find({name: req.body.name}).exec()
    .then(exists=>{
        if(exists.length>=1){
            return res.status(409).json({
                message: 'Produkt już istnieje'
            });
        }
    product.save()
    .then(result=>{
        console.log(result);
        res.status(201).json({
            message: "Utworzono produkt",
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request:{
                    type:'GET',
                    url: 'http://localhost:3000/products/'+result._id
                }
            }
          });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    })
});


router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                product: doc,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/products/'
                }
            });
        }else {
            res.status(404).json({message: 'Nie ma takiego numeru ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Zaktualizowano produkt',
            request:{
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:productId',  checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto produkt',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/products/',
                body: {name: 'String', price:'String'}
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.delete('/purge',  checkAuth, (req, res, next) => {
    Product.remove({}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto wszystkie produkty'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;