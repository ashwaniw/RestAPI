var ex = require('express');
var bp = require('body-parser');
var mon = require('mongoose');
var cor = require('cors');
var jwt = require('jsonwebtoken');

var ap = ex();
ap.use(cor());

/*ap.use(function (req, res, next) {        
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');  
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');    
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');      
    res.setHeader('Access-Control-Allow-Credentials', true);       
    next();  
});*/

ap.use(bp.urlencoded({extended:false}));
ap.use(bp.json());

//establish database connection
const url = 'mongodb://localhost:27017/CADB';
mon.connect(url,function(err){
    if(err){
        console.log('error');
    }else{
        console.log('connected'); 
    }
})

//create schema for database table
const userS = mon.Schema;
const userST = new userS({
    'username'     : String,
    'password'     : String,
    'email'        : String,
    'dob'          : Date,
    'dept'         : String,
    'mobNo'        : Number,
    'gender'       : String,
    'maritalStatus': String,
    'city'         : String,
    'state'        : String,
    'zip'          : Number,
    'regdate'      : Date,
})

//connect schema with database table
const userSTB = mon.model('MyDB',userST,'membership');

// function verify token
/*function verifyToken(req,res,next)
{
    if(!req.headers.authorization)
    {
        return res.status(401).send('Unauthorized Request.......');
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token === 'null')
    {
        return res.status(401).send('Unauthorized Request');
    }
    else
    {
        //jwt.sign()
        let payload = jwt.verify(token,'secretKey',(err,token1)=>{
             if(err)
             {
                return res.status(401).send('Unauthorized Request');
             }   
             else
             {
                req.userId=token1.subject;
                next();         
             }
        });
    }

};*/

//check service route
ap.get('/fetchdata', function(req,res){
    userSTB.find({},function(err,data){
        if(err){
            console.log('error')
        }else{
            res.send(data);
        }
    })
})

//register user 
ap.post('/savemember', (req, res)=>{
    const userData = req.body;
    console.log(userData);
    const user =new userSTB(userData);
    userSTB.findOne({username:userData.username},function(err, data){
        if(err){
            console.log(err);
        }
        if(data){
            res.status(401).send('User already exist');
        }else{            
            user.save(function(err, data){
                if(err){
                    console.log(err)
                }else{
                    res.send(data);
                }
        })
    }    
    })
})

// edit route
ap.get('/edit/:id', function(req, res){    
    const id = req.params.id;
    console.log(id);
    userSTB.findById(id, function (err, data){
        if(err){
            console.log(err)
        }if(data){
            res.send(data);
        }        
    });
})

// update user route 
ap.put('/updateUser/:id', (req, res)=>{
    const userData = req.body;   
    console.log(userData); 
    const user = new userSTB(userData);
    userSTB.findByIdAndUpdate(req.params.id,
        {$set:{username: userData.username, password: userData.password}},
        {
            new: true
        },
        function(err, data){
        if(err){
            console.log(err);
        }
        if(data){
            //res.status(201).send('User updated');
            res.json(data); 
    }    
    })
})

//login route
ap.post('/login', (req,res)=>{//callback function  
    let userData=req.body;    
    userSTB.findOne({username:userData.username},function(error,user){
        if(error){
            console.log('error');
        }
        else{
            if(!user){
                res.status(401).send('invalid username');
            }
            else{
                if(user.password!==userData.password){
                    res.status(401).send('invalid password');
                }
                else{                  
                    res.json(user);
                }
            }
        }
	});
});
// delete
ap.delete('/delete/:id', (req, res) => {//callback function      
    let userID = req.params.id;
    //console.log(userID);
    userSTB.findByIdAndRemove(userID, function (error, userDeleted) {
        if (error) {
            console.log('error');
        }
        else {
            res.json(userDeleted);
        }
    });
});

ap.get('/secured', function(req, res){
    userSTB.find({}, function(err,data){
        if(err){
            console.log(err);
        }if(data){
            res.send(data);
        }
    })
})

//host program over http
ap.listen(5300, true);
console.log('service started');