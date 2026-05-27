import { Listener , Subjects , OrderStatus , OrderCreatedEvent } from "@ahabtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import Order from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    queueGroupName = queueGroupName ;
    subject = Subjects.OrderCreated as const ;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        
        const order = Order.build({
            id : data.id ,
            price : data.ticket.price ,
            status : data.status ,
            userId : data.userId ,
            version : data.version
        })

        await order.save() ;

        msg.ack() ;
    }
}