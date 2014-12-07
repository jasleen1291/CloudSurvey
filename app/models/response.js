
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ResponseSchema= new Schema({
	
	"id": String,
        "question":String,
	"response": String
	
});

// Functions which will be available to external callers
module.exports = mongoose.model('Response',ResponseSchema);
