const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const TransactionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
    client: {type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true},
    date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Transaction', TransactionSchema);