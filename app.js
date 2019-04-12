require('dotenv').config({silent: true})

const express = require("express");
const app = express();
const childProcess = require("child_process");

const bodyParser = require('body-parser');

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// enable cors
const cors = require('cors')
app.use(cors());

const git = {
  user: process.env.GIT_USER,
  pass: process.env.GIT_PASS
};

const now = new Date();
app.get('/', function(req, res){
  res.send(`[${now}] Server Running...`)
});

app.post("/webhooks/github", function(req, res) {
  let sender = req.body.sender;
  let branch = req.body.ref;

  // console.log('BODY', req.body);
  // if (branch.indexOf(process.env.GIT_BRANCH) > -1 && sender.login === git.user) {
    deploy(res);
  // }else{
  // }
});

function deploy(res) {
  childProcess.exec("./deploy.sh", function(err, stdout, stderr) {
    if (err) {
      console.error(err);
      return res.send(500);
    }
    console.log('STDOUT', stdout);
    res.status(200).send('OK');
  });
}

const port = process.env.PORT;
app.listen(port , ()=>{
  console.log('Endpoint: http://localhost:'+port);
})
