require('dotenv').config({silent: true})

const express = require("express");
const app = express();
const childProcess = require("child_process");

const git = {
  user: process.env.GIT_USER,
  pass: process.env.GIT_PASS
};

const now = new Date();
app.get('/', function(req, res){
  res.send(`[${now}] Server Running...`)
});

app.post("/webhooks/github", function(req, res) {
  var sender = req.body.sender;
  var branch = req.body.ref;

  if (branch.indexOf(process.env.GIT_BRANCH) > -1 && sender.login === git.user) {
    deploy(res);
  }
});

function deploy(res) {
  childProcess.exec("./deploy.sh", function(err, stdout, stderr) {
    if (err) {
      console.error(err);
      return res.send(500);
    }
    res.send(200);
  });
}

const port = process.env.PORT;
app.listen(port , ()=>{
  console.log('Endpoint: http://localhost:'+port);
})
