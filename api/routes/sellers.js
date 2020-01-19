const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const Seller = require('../models/seller');

router.get('/', checkAuth, (req, res, next)=>{
    Seller.find()
    .select('name surname email _id')
    .exec()
    .then(docs =>{
        const response = {
            count: docs.length,
            sellers: docs.map(doc =>{
                return{
                    name: doc.name,
                    surname: doc.surname,
                    email: doc.email,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/sellers/'+doc._id
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
    const seller = new Seller({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email
    });Seller.find({email: req.body.email}).exec()
    .then(exists=>{
        if(exists.length>=1){
            return res.status(409).json({
                message: 'E-mail już istnieje'
            });
        }
        seller.save()
            .then(result=>{
                console.log(result);
                res.status(201).json({
                    message: "Utworzono sprzedawce",
                    createdSeller: {
                        name: result.name,
                        surname: result.surname,
                        email: result.email,
                        _id: result._id,
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/sellers/'+result._id
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
        
    });
})
router.get('/:sellerId', checkAuth, (req, res, next) => {
    const id = req.params.sellerId;
    Seller.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                seller: doc,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/sellers/'
                }
            });
        }else {
            res.status(404).json({message: 'Nie ma sprzedawcy o takim numerze ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch('/:sellerId', checkAuth, (req, res, next) => {
    const id = req.params.sellerId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Seller.update({_id: id}, {$set: updateOps}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Zaktualizowano sprzedawce o Id',
            request:{
                type: 'GET',
                url: 'http://localhost:3000/sellers/' + id
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

router.delete('/:sellerId',  checkAuth, (req, res, next) => {
    const id = req.params.sellerId;
    Seller.remove({_id: id}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto sprzedawce',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/sellers/',
                body: {name: 'String', surname:'String', email: 'String'}
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


module.exports = router;