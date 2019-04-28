const { REDIS } = require('../lib');

const express = require('express');
const router = express.Router();

router.post("/add", (req, res, next)=>{
  REDIS.get(process.env.UUID).then(data=>{
    let payload = {
      uuid : require('uuid/v4')(),
      baseDirectory: req.body.dir,
      repositoryName: req.body.repo,
      branch: req.body.branch,
      name: req.body.branch,
      script: req.body.script
    };
    data.push(payload);
    REDIS.create(process.env.UUID, data).then(data=>{
      console.info('Success in saving', data);
    }).catch(error=>{
      console.error('Error in saving', error);
    })
  }).catch(error=>{
    console.error('Error in saving', error);
  }).finally(()=>{
    res.redirect("/");
  });
});

router.post("/delete/:uuid", (req, res, next)=>{
  REDIS.get(process.env.UUID).then(data=>{
    let payload = data.filter(e=>e.uuid !== req.params.uuid);
    REDIS.create(process.env.UUID, payload).then(data=>{
      console.info('Success in deleting', data);
    }).catch(error=>{
      console.error('Error in deleting', error);
    })
  }).catch(e=>{
    console.error(`Error in deleting ${req.params.uuid}`, error);
  }).finally(()=>{
    res.redirect("/");
  })
});

router.post("/edit/:uuid", (req, res, next)=>{
  REDIS.get(process.env.UUID).then(data=>{
    let payload = data.map(e=>{
      if(e.uuid === req.params.uuid){
        e.baseDirectory = req.body.dir;
        e.repositoryName = req.body.repo;
        e.branch = req.body.branch;
        e.name = req.body.branch;
        e.script = req.body.script;
      }
      return e;
    });
    REDIS.create(process.env.UUID, payload).then(data=>{
      console.info('Success in update', data);
    }).catch(error=>{
      console.error('Error in update', error);
    })
  }).catch(e=>{
    console.error(`Error in update ${req.params.uuid}`, error);
  }).finally(()=>{
    res.redirect("/");
  })
});

module.exports = router;
