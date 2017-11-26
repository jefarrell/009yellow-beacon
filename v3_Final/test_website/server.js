const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cred = require('./cred.js')

const app = express();
mongoose.Promise = global.Promise;
const url = cred.mlab;

mongoose.connect(url);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
	console.log("Database open")
	const server = app.listen(3000, () => {
		const host = server.address().address;
		const port = server.address().port;
		console.log("Server listening at %s%s", host, port);
	});	
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/dist/')));
app.use(express.static(path.join(__dirname, '/public/assets')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use(favicon('public/assets/favicon.ico'));


const routes = require('./routes/index');

app.get('/', routes.index);
app.get('/test', routes.test);
app.post('/addData', routes.addData);
app.get('/mapData', routes.mapData);
app.post('/inputgeo', routes.inputgeo);
app.get('/klaviyo', routes.klaviyo);
app.get('/latest', routes.latest);