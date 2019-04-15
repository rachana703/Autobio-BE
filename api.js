var http = require('http');
var express = require('express'); 
var bodyParser = require("body-parser");
var app = express();  //var app as object


app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
app.use(express.static('static'));

app.use(express.static('/public'));
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/',function(req,res){
	
  	res.sendFile("C:/autobioscrypt/autobio_bigchain_ftf/FarmToFork-master/index.html");
});



app.set('port', 3000);

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

