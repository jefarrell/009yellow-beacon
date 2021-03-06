var Point = require('../models/Point');

module.exports = function (app) {
    app.get('/', function (req, res) {
//        makeFakeData();
        return res.render('index', {message: "teehee"});
    });

    app.post('/addDescription', function(req, res) {
        var description = req.body.descriptionInput;
        var waypoint_id = req.body.waypoint_id;
        console.log(waypoint_id);
        Point.addDescription(waypoint_id, description, function(err) {
            handle_err();
            res.redirect('back'); // TODO: might want to not reload the entire thing
        });
    });

    app.get('/allQueens', function(req, res) {
        Point.getAllCurrentQueenLocations(function(err, data) {
            handle_err(err);
            return res.send(data);
        });
    });

    app.get('/allQueenWaypoints', function(req, res) {
        var queenid = req.headers.queenid;
        Point.getWaypointsFromQueen(queenid, function(err, data) {
            handle_err(err);
            return res.send(data);
        });
    });
    
    app.get('/allQueenWaypointsFromWaypoint', function(req, res) {
        var waypointid = req.headers.waypointid;
        Point.getWaypointsFromWaypoint(waypointid, function(err, data) {
            handle_err(err);
            return res.send(data);
        });
    });

    app.get('/all', function(req, res) {
        Point.getAll(function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.send(data);
            }
        });
    });

//    app.get('/keyboard', function(req, res) {
//        console.log("keyboard initialize");
//        var queenid = req.headers.queenid;
//        console.log(queenid);
//        res.type('json');
//        res.send({blah:"gee"});
//        //var allQueens = Point.getAll
//    });

};

var handle_err = function(err) {
    if (err) {
         return console.log(err);
    }
};

// makes scout1 current, past, past scout2 current
// queen1 current past, past, queen 2 current
// waypoint1, wpt2
var makeFakeData = function() {
        var point = new Point({ 
            scout: "scout1", 
            queen: "",
            isWaypoint: false,
            isCurrent:true, 
            latitude:51.502, 
            longitude:-0.015, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        });  
        point = new Point({ 
            scout: "scout1", 
            queen: "",
            isWaypoint: false,
            isCurrent:false, 
            latitude:51.503, 
            longitude:-0.014, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        });  
        point = new Point({ 
            scout: "scout1", 
            queen: "",
            isWaypoint: false,
            isCurrent:false, 
            latitude:51.504, 
            longitude:-0.013, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        });
    
        point = new Point({ 
            scout: "scout2", 
            queen: "",
            isWaypoint: false,
            isCurrent:true, 
            latitude:51.505, 
            longitude:-0.012, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        });
        point = new Point({ 
            scout: "", 
            queen: "queen1",
            isWaypoint: false,
            isCurrent:true, 
            latitude:51.506, 
            longitude:-0.011, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        }); 
        point = new Point({ 
            scout: "", 
            queen: "queen1",
            isWaypoint: false,
            isCurrent:false, 
            latitude:51.507, 
            longitude:-0.010, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        }); 
        point = new Point({ 
            scout: "", 
            queen: "queen1",
            isWaypoint: false,
            isCurrent:false, 
            latitude:51.508, 
            longitude:-0.009, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        }); 
        point = new Point({ 
            scout: "", 
            queen: "queen2",
            isWaypoint: false,
            isCurrent:true, 
            latitude:51.509, 
            longitude:-0.008, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        });
        point = new Point({ 
            scout: "scout1", 
            queen: "queen1",
            isWaypoint: true,
            isCurrent:false, 
            latitude:51.510, 
            longitude:-0.007, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        }); 
        point = new Point({ 
            scout: "scout2", 
            queen: "queen2",
            isWaypoint: true,
            isCurrent:false, 
            latitude:51.511, 
            longitude:-0.006, 
            description:"", 
            time:13, 
            needsTransmit:false,
        });
        point.save(function(err) {
            console.log("saved");
        }); 
}
