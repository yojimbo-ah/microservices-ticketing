import {MongoMemoryServer} from "mongodb-memory-server" ;
import mongoose from "mongoose";
import jwt from 'jsonwebtoken' ;

declare global {
    var getAuthCookie: (email ?: string , id? : string) => Promise<string[]>;  
}

let mongo : MongoMemoryServer

beforeAll(async () => {
    process.env.JWT_KEY = 'supersecretpassword' ;
    // creating a instance of mongo db storage in memory 
    // then connecting to it , before running any test , this
    // function runs before any code inside our testing side of
    // of code

    mongo = await MongoMemoryServer.create() ;
    const mongoUri = mongo.getUri() ;
    await mongoose.connect(mongoUri) ;
} , 1000000)


beforeEach(async () => {
    jest.clearAllMocks() ; // reset mock function since it saves iteself
    const collections = await mongoose.connection.db?.collections() ;
    // we might have a array of collections or undefiend so 
    // we typecheck and we loop on the colelctions we have and
    // we delete the collection
    if (collections?.length) {
        Promise.all(collections.map(async (collection) => {
            await collection.deleteMany() ;
        }))
    }
})

afterAll(async () => {
    // we have to stop the mongo db instance in the memory after
    // we are finished with the testing
    await mongo.stop() ; // stops the mongo db insctance
    await mongoose.connection.close() ; // ends the mongoose connection 
})

global.getAuthCookie = async (email  , id) => {
    let jwtToken ;
    if (email && id) {
        jwtToken = jwt.sign({
            email , id
        }, process.env.JWT_KEY!)
    } else {
        jwtToken = jwt.sign({
        email :  'test@test.com' ,
        id : 'jasjdsjajd'
        }, process.env.JWT_KEY!) ;
    }

    const session = {jwt : jwtToken} ;
    const sessionJSON = JSON.stringify(session) ;
    const base64 = Buffer.from(sessionJSON).toString('base64') ;

        // return only the cookie name=value so it can be sent in the `Cookie` header
        return [ `session=${base64}` ] ;
}