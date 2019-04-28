const redis = require('redis');

const client = redis.createClient({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST
});

module.exports = {
  client,
  connect: () => {
    client.on('connect', () => {
      console.info(`[Redis] Connected to http://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
    })
    client.on('error', (error) => {
      console.error(`[Redis] Connection to http://${process.env.REDIS_HOST}:${process.env.REDIS_PORT} failed.`, {error})
      process.exit(1)
    })
  },
  create : (key, payload)=>{
    return new Promise((resolve, reject)=>{
      client.set(key, JSON.stringify(payload), (e, reply)=>{
        if(e){
          console.error(`[Redis][Create] Failed - `, e);
          reject(e);
        }
        resolve(reply);
      });
    });
  },
  get: (guid)=>{
    return new Promise((resolve, reject)=>{
      client.get(guid, (e, reply)=>{
        if(e){
          console.error(`[Redis][Get] Failed fetching ${guid}.`, e);
          reject(e);
        }else{
          try{
            if(reply){
              resolve(JSON.parse(reply));
            }else{
              console.error(`[Redis][Get] Failed fetching ${guid}.`);
              reject({
                msg: 'Session not found.'
              });
            }
          }catch(err){
            console.error(`[Redis][Get] Failed fetching ${guid} as json.`, err);
            reject(err);
          }
        }
      });
    });
  },
  updateTTL: (guid, expiration = 3600)=>{
    return new Promise((resolve, reject)=>{
      let result = client.expire(guid, expiration);
      if(result) resolve(result);
      reject(result);
    });
  },
  delete: (guid)=>{
    return new Promise((resolve, reject)=>{
      client.del(guid, (e, reply)=>{
        if(e){
          console.error(`[Redis][Delete] Failed deleting ${guid}.`, e);
          reject(e);
        }
        resolve(reply);
      })
    });
  }
};
