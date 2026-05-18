/* eslint-disable no-console */

import mongoose from "mongoose";
import app from "./app.js";
import type { Server } from "http";
import config from "./app/config/index.js";
import { seedSuperAdmin } from "./app/utlis/seedSuperAdmin.js";
import { connectRedis } from "./app/config/redis.config.js";




let server:Server



const main = async () => {
  try {
    await mongoose.connect(config.database_url as string);

   server = app.listen(config.port, () => {
       console.log(`server set up  app running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
}


(async () => {
    await connectRedis()
    await main()
    await seedSuperAdmin()
})()

process.on('SIGTERM',() =>{
    console.log('SIGTERM dective.. server down');
    if(server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})



process.on('SIGINT',() =>{
    console.log('SIGINT dective.. server down');
    if(server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})



process.on('unhandledRejection',(err) =>{
    console.log('unhandle reacjection dective.. server down', err);
    if(server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})
process.on('uncaughtException',(err) =>{
    console.log('uncaughtException dective.. server down', err);
    if(server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})
// Promise.reject(new Error ("forget to catch this promished"))
// throw new Error ("forget to catch local error")
