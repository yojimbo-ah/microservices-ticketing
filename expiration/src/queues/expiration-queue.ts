import  Queue  from "bull";
import { OrderExpiredPublisher } from "../events/publishers/order-expired-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
    orderId : string
}
// the data added in the queue should be of type Payload 
// just so typescript help us 
const expirationQueue = new Queue<Payload>('order:expiration' , {
    redis : {
        host : process.env.REDIS_HOST
    }
})


expirationQueue.process(async(job) => {
    // job is similair to msg in node nats streaming 
    await new OrderExpiredPublisher(natsWrapper.client).publish({
        orderId : job.data.orderId
    }) ;
})

export {expirationQueue}