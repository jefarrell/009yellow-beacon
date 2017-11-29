var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Point is the model class that represents tweets
 * content field: the text of the tweet
 * author field: the author of the tweet
*/
var PointSchema = new Schema({
    Scout: { type: String }, // for Scout locations and waypoints
    Queen: { type: String }, // for Queen locations and waypoints
    isWaypoint: { type: Boolean, required: true },
    isCurrent: {type: Boolean, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    description: { type: String },
    time: { type: Number, required: true },
    needs_transmit: { type: Boolean},
});


PointSchema.statics.getAllCurrentScoutLocations = function (callback) {
    Point.find({ 'isCurrent': true , 'Scout': {$exists:true} }, function (err, docs) {
        return callback(err, docs);
    });
};

PointSchema.statics.getAllCurrentQueenLocations = function (callback) {
    Point.find({ 'isCurrent': true , 'Queen': {$exists:true} }, function (err, docs) {
        return callback(err, docs);
    });
};

PointSchema.statics.getScoutTracks = function (scout_id, callback) {
    Point.find({ 'Scout': scout_id, 'isCurrent': false , 'isWaypoint': false }, function (err, docs) {
        return callback(err, docs);
    });
};

PointSchema.statics.getQueenTracks = function (queen_id, callback) {
    Point.find({ 'Queen': queen_id, 'isCurrent': false , 'isWaypoint': false }, function (err, docs) {
        return callback(err, docs);
    });
};

PointSchema.statics.getWaypoints = function (callback) {
    Point.find({ 'isWaypoint': true }, function (err, docs) {
        return callback(err, docs);
    });
};

PointSchema.statics.getSingleWaypoint = function (waypoint_id, callback) {
    Point.findOne({ '_id': waypoint_id, 'isWaypoint': true }, function (err, docs) {
        return callback(err, docs);
    });
};

PointSchema.statics.getWaypointsFromQueen = function (queen_id, callback) {
    Point.find({ 'Queen': queen_id, 'isWaypoint': true }, function (err, docs) {
        return callback(err, docs);
    });
};


var Point = mongoose.model('Point', PointSchema);
module.exports = Point;