require('dotenv').config({silent: true})

const express = require("express");
const app = express();
const childProcess = require("child_process");
const path = require('path');

const bodyParser = require('body-parser');

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// enable cors
const cors = require('cors')
app.use(cors());

const { REDIS, QUEUE } = require('./lib')

REDIS.connect();
QUEUE.initialize();

//set the template engine into ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// serve the files out of ./public as our main files
app.use('/static', express.static(path.join(__dirname, 'dist')));

const now = new Date();

app.get('/', function(req, res){
  res.send('NOTHING HERE');
  return;
  let render = {
    data: null,
    error: null
  };
  if(process.env.UUID == "" || process.env.UUID == undefined){
    render.error = 'UUID is not properly set.';
    return res.render('page/index', {
      now: now,
      ...render
    });
  }else{
    REDIS.get(process.env.UUID).then(data=>{
      render.data = data;
      res.render('page/index', {
        now: now,
        ...render
      });
    }).catch(errors=>{
      let defaultSettings = [
        {
          uuid: require('uuid/v4')(),
          repositoryName: "fansights-app",
          branch: "master",
          name: "master",
          baseDirectory: require('os').homedir(),
          script: `echo START DEPLOY SCRIPT HERE!!`
        }
      ];
      REDIS.create(process.env.UUID, defaultSettings).then(data=>{
        render.data = defaultSettings;
      }).catch(error=>{
        render.error = error;
      }).finally(()=>{
        res.render('page/index', {
          now: now,
          ...render
        });
      });
    })
  }
});

app.post("/webhooks/github/:repoUuid", function(req, res) {
  REDIS.get(process.env.UUID).then(data=>{
    let getBranch = data.filter(e=>e.uuid===req.params.repoUuid);
    if(getBranch.length > 0){
      let branchDetails = getBranch[0];
      if(['push'].indexOf(req.headers["x-github-event"])>-1){
        let branch = req.body.ref;
        let repository = req.body.repository.name;
        if(branch.indexOf(branchDetails.branch) > -1 && repository.indexOf(branchDetails.repositoryName) > -1){
          QUEUE.createJob(branchDetails);
          res.status(200).send('SUCCESS - JOB DEPLOYMENT On-QUEUE');
        }else{
          res.status(500).send('FAILED - branch and repository doesnt match with webhook details.');
        }
      }else if(['ping'].indexOf(req.headers["x-github-event"])>-1){
        res.status(200).send('PING SUCCESS');
      }else{
        res.status(500).send(`FAILED - Event ${req.headers["x-github-event"]} is not registered`);
      }
    }else{
      res.status(500).send('FAILED - Webhook details not found. Check your repository uuid.');
    }
  }).catch(error=>{
    res.status(500).send('FAILED - UUID is not initialized.');
  });
});

app.use("/branch", require('./routes'))

const port = process.env.PORT;
app.listen(port , ()=>{
  console.log('Endpoint: http://localhost:'+port);
})
