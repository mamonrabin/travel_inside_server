import { createClient } from 'redis';
import config from "../config/index.js"

export const redisClient = createClient({
    username: config.redis_user as string,
    password: config.redis_password as string,
    socket: {
        host: config.redis_host,
        port: Number(config.redis_port)
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));



// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar


export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis Connected");
    }
}





