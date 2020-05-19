var express = require('express')
var app = express()
var bodyParser = require('body-parser')


app.listen(3000,function(){
})

app.use(express.static('static'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))



app.get('/',function(req,res){
    res.sendFile(__dirname+"/templates/index.html")
    })


app.get('/main',function(req,res){
res.sendFile(__dirname+"/templates/base.html")
})

app.post('/searchby',function(req,res){
res.json(req.body)
})