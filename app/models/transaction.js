
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var TransactionSchema= new Schema({
	
	"id": String,
        "price":String,
	"paid": String,
        "date":Date
	
});

// Functions which will be available to external callers
module.exports = mongoose.model('Transaction',TransactionSchema);
