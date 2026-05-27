import { Listener , OrderCreatedEvent, OrderStatus, Subjects } from "@ahabtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    queueGroupName = queueGroupName ;
    subject = Subjects.OrderCreated as const ;
    async onMessage(data: OrderCreatedEvent['data'] , msg: Message)  {
        // the logique of handeling the setting a timer that 
        // will trigger a event (pblishes a event) of expiration
        // to other services after certain time (per exp 15 min)
        const timeDiff = new Date(data.expiresAt).getTime() - new Date().getTime()
        await expirationQueue.add({
            orderId : data.id
        }, {
            delay : timeDiff
        }) ;
        msg.ack() ;
    }
}