const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const clientSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{type:String,required:true},
    surname:{type:String,required:true},
    age:{type:Number,required:false},
    email: {
        type: String, 
        requre: true, 
        unique: true, 
        match:  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},
});

module.exports = mongoose.model('Client', clientSchema);
