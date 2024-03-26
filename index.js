var express = require("express");
var app = express();
var mysql = require("mysql2");
var md5=require("md5");
var moment = require('moment'); // require
moment().format(); 

// let x=md5("ak@123"+"ak@1234");
// let y=md5("ak@123"+"ak@1234");
// console.log("x",x);
// console.log("y",y)

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port=3001;
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "db_reg",
  });
  connection.connect(function (err) {
    if (err) {
      console.log("Error in the connection");
      console.log(err);
    } else {
      console.log(`Database Connected`);
    }
  });


  function randomStr(len, arr) {
    let ans = '';
    for (let i = len; i > 0; i--) {
        ans +=
            arr[(Math.floor(Math.random() * arr.length))];
    }
    return ans;
}
  app.get("/register",async(req, res) => {

    res.render("register.ejs");
  });
  app.post("/register/:code",async(req,res)=>{
     const code=req.params.code
     console.log(code)
    fdata=req.body;
    const name=fdata.name;
    const phone=fdata.phone;

    const email=fdata.email;
    // var url=`/activate/${code}`
     connection.query(`select * from user_registration where email='${email}'`,(err,result)=>{
    console.log(result);
     let flag=true
    if(result.length>0){
      if(result.password!=''){
          flag=false
          // return;
      }
    } else{
      flag=true;
       connection.query(`insert into user_registration(name,phone,email,code) values('${name}','${phone}','${email}','${code}')`);
    }
    console.log(flag);
    res.json(flag);
   });
  
   
  //  console.log("confemail",confemail)
    
    // console.log(fdata);
    //  connection.query(`insert into user_registration(name,phone,email,code) values('${name}','${phone}','${email}','${code}')`);
    // res.send(`"<h1>Thank you for registration</h1><h2>Click here to activate your account:-<a href=${url}>Activate</a></h2>"`
   
   
    // )
  //  res.send("Thank you for registration")


  });
//   app.get("/activate/:code",(req,res)=>{

//     // res.render("password.ejs")
//     // const activationcode=req.params.code
//     // res.send(`"<h1>your activation code is:</h1>"`)
//   })
app.get("/activate/:code",async(req,res)=>{
    const code=req.params.code
 let y=connection.query(`select created_on from user_registration where code='${code}'`,(err,result)=>{
    console.log(result)
    const myJSON = (result.created_on); 
   let link_duration= moment(myJSON).add(10000, 'milliseconds');
    //  console.log(myJSON)
    console.log("link_duration",link_duration)
    let now=moment();
   console.log("now",now)
   if(link_duration>now){
        res.render("password.ejs")
   }
   else{
    res.send("<h2>Sorry Link Has been expired</h2>")
   }
  
 });
 
})

app.post("/setPassword/:code",(req,res)=>{
    const code=req.params.code
    pdata=req.body;
    let salt=randomStr(4,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
    const password=pdata.password[0];
    console.log("salt",salt);
    console.log("password",password);
    const combinepassword=salt+password
    const finalpassword=md5(combinepassword);
    console.log("encrypted",finalpassword);
    var query=`update user_registration set password ='${finalpassword}', salt='${salt}' where code='${code}'`;
    connection.query(query);
    res.send("ok");
  

    
})
app.get("/login",(req,res)=>{
  res.render("login.ejs");
  // ldata=req.body;
  // console.log(ldata);

});
app.post("/login",async(req,res)=>{
   ldata=req.body;
  console.log(ldata);
  email=ldata.loginemail;
  userpassword=ldata.loginpassword;
  console.log(userpassword);

  const query = (str) => {
    return new Promise((resolve, reject) => {
      connection.query(str, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }




  let a=await query(` select * from user_registration where email='${email}'`);
  console.log(a)
  // let flag=true;
  // if(a!=""{
  //   if(a[0].password)!{

  //   }
  // })
  let  flag=true;
  if(a==''){
    flag=false;
    // return
  }
  if(a!=''){
    if(a[0]['password']!=""){  let z=(a[0]['salt'])
    console.log(z)
    const y=md5(z+userpassword);
    console.log(z+userpassword);
    console.log("y",y)
    console.log(a.password!=y)
    console.log("ap",a[0]['password'])
    
    if(!(a[0]['password']==y)){
      
        flag=false;
        
    }//else{
    //   flag=true;
    // // }
    // flag=true;
  }
} 
console.log("flg",flag)
res.json(flag);
});   
    
  
  

 

app.get("/forgetpassword",async(req,res)=>{
  res.render("forgetpassword.ejs");
});
app.post("/forgetpassword",async(req,res)=>{
  console.log(req.body);
  email=req.body.loginemail;
  console.log(email);
  flag=true;
   connection.query(`select * from user_registration where email='${email}'`,(err,result)=>{
    if(err)throw err;
    console.log(result[0]);

   if(result[0]==undefined){
     flag=false;
      // res.json(flag);
    
    }
    else{
    
      flag=true ;
    }
    res.json(flag)
    
   
  })
});
app.get("/resetpassword/:em",(req,res)=>{
  res.render("resetpassword.ejs");
});
app.post("/resetpassword/:em",(req,res)=>{
  rpdata=req.body;
  email=req.params.em
  console.log(rpdata);
  console.log(email)
  const salt=randomStr(4,'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
  let combinepassword=salt+rpdata.rpassword;
  console.log(combinepassword);
  let finalpassword=md5(combinepassword);
  console.log('finalpassword',finalpassword);
  connection.query(`update user_registration set password='${finalpassword}', salt='${salt}' where email='${email}' `);
  res.send("ok");
});









  app.listen(port,(err)=>{
    if(err)throw err;
    console.log(`app is listening on ${port}`)
  });
  
