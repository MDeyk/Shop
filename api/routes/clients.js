const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const Client = require('../models/client');

router.get('/', checkAuth, (req, res, next)=>{
    Client.find()
    .select('name surname age email _id')
    .exec()
    .then(docs =>{
        const response = {
            message: "Lista Wszystkich Klientów",
            count: docs.length,
            clients: docs.map(doc =>{
                return{
                    name: doc.name,
                    surname: doc.surname,
                    age: doc.age,
                    email: doc.email,
                    _id: doc._id,
                    url:{
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/clients/'+doc._id
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

router.post('/dodaj', checkAuth, (req, res, next)=>{
    const client = new Client({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        surname: req.body.surname,
        age: req.body.age,
        email: req.body.email
    });Client.find({email: req.body.email}).exec()
    .then(exists=>{
        if(exists.length>=1){
            return res.status(409).json({
                message: 'E-mail już istnieje'
            });
        }
        client.save()
            .then(result=>{
                console.log(result);
                res.status(201).json({
                    message: "Utworzono klienta",
                    createdClient: {
                        name: result.name,
                        surname: result.surname,
                        age: result.age,
                        email: result.email,
                        _id: result._id,
                        request:{
                            type:'GET',
                            url: 'http://localhost:3000/clients/'+result._id
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
router.get('/:clientId', checkAuth, (req, res, next) => {
    const id = req.params.clientId;
    Client.findById(id)
    .exec()
    .then(doc =>{
        console.log("From database", doc);
        if(doc){
            res.status(200).json({
                client: doc,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/clients/'
                }
            });
        }else {
            res.status(404).json({message: 'Nie ma klienta o takim numerze ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch('/:clientId', checkAuth, (req, res, next) => {
    const id = req.params.clientId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Client.update({_id: id}, {$set: updateOps}).exec()
    .then(result =>{
        res.status(200).json({
            message: 'Zaktualizowano Id klienta',
            request:{
                type: 'GET',
                url: 'http://localhost:3000/clients/' + id
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

router.delete('/:clientId',  checkAuth, (req, res, next) => {
    const id = req.params.clientId;
    Client.remove({_id: id}).exec()
    .then(result =>{
        res.status(200).json({
            message:'Usunięto klienta',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/clients/',
                body: {name: 'String', surname:'String',age:'Number', email: 'String'}
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