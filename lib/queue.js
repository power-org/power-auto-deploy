const RedisSMQ = require('rsmq');
const childProcess = require("child_process");

const rsmq = new RedisSMQ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ns: "rsmq"
});

const QUEUE_JOB = 'github-job-queue';

let que = {
  initialize: ()=>{
    rsmq.listQueuesAsync().then(data=>{
      console.info(`[Que][initialize] - Success... http://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`);
      let jobQueue = data.filter(e=>e===QUEUE_JOB);
      if(jobQueue.length === 0){
        rsmq.createQueue({ qname: QUEUE_JOB}, (err, resp) => {
            if (resp === 1) {
              console.info(`[Que][createQue] - Initialized.`);
              que.startWorker();
              return;
            }
            console.error('[Que][createQue] - error', err);
            process.exit(1);
        });
      }else{
        console.info(`[Que][createQue] - Initialized.`);
        que.startWorker();
      }
    }).catch(e=>{
      console.error('[Que][initialize] - error', e);
      process.exit(1);
    });
  },
  createJob: (payload)=>{
    rsmq.sendMessage({
      qname: QUEUE_JOB,
      message: JSON.stringify(payload),
    }, (err, resp) => {
      if (resp){
        console.info('[Que][createJob] - Message sent success', resp);
        return;
      }
      console.error('[Que][createJob] - error', err);
    });
  },
  startWorker: ()=>{
    const RSMQWorker = require( "rsmq-worker" );
    const worker = new RSMQWorker(QUEUE_JOB);

    worker.on( "message", function( msg, next, id ){
      // process your message
      console.info('[Que][startWorker][onmessage]', msg);
      let data = JSON.parse(msg);
      childProcess.exec(data.script.replace(/\r/gim, ""), function(err, stdout, stderr) {
        if (err) {
          console.error('JOB - Error', {error: err, stderr: stderr});
        }
        console.log('JOB - Succes\n', stdout);
      });
      next();
    });

    // optional error listeners
    worker.on('error', function( err, msg ){
      console.error(`[Queue][worker][error]`, {err, msg})
    });
    worker.on('exceeded', function( msg ){
      console.warn(`[Queue][worker][exceeded]`,msg)
    });
    worker.on('timeout', function( msg ){
      console.warn(`[Queue][worker][timeout]`,msg)
    });

    worker.start();
  }
};

module.exports = que;
