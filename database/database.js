import mongoose from "mongoose";
const mongoUrl = process.env.MONGOURI
if(!mongoUrl) return new Error("No Mongo Uri found to connect..")
let cache = global.mongoose || {promise:null,conn:null}

async function database() {
    if(cache.conn) return cache.conn

    if(!cache.promise){
        try {
            cache.promise = mongoose.connect(mongoUrl).then((m)=>m)
             console.log("MongoDB connected ✅");
        } catch (error) {
            console.log(error.message)
        }
    }

    cache.conn  =await cache.promise
    global.mongoose = cache.conn
    return cache.conn
}
export default database