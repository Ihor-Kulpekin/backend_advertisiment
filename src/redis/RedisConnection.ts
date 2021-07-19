import redis from 'redis';

export const withRedis =  () => {
    const redisClient = redis.createClient(888);
    redisClient.on('connect', ()=> {
        console.log("You are now connected");
    })
}
