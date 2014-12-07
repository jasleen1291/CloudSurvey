var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var SurveySchema   = new Schema({
	
	"name"           : String,
	"question"       : String,
	"user_id"        : String,
	"expiration_date": Date,
        "start_date":Date
	
});

autoIncrement.initialize(mongoose);
SurveySchema.plugin(autoIncrement.plugin, 'survey_id');

module.exports = mongoose.model('Survey', SurveySchema);
              