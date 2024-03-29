const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const sellerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{type:String,required:true},
    surname:{type:String,required:true},
    email: {
        type: String, 
        requre: true, 
        unique: true, 
        match:  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},
    password: {type: String, require: true}
});

module.exports = mongoose.model('Seller', sellerSchema);