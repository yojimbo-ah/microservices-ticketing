import { Listener , Subjects , OrderStatus , OrderCancelledEvent } from "@ahabtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import Order from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    queueGroupName = queueGroupName ;
    subject = Subjects.OrderCancelled as const ;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        // we search for the last saved version 
        // so we dont have concurency errors
        const order = await Order.findOne({
            _id : data.id ,
            version : data.version - 1 
        }) ; 
        if (!order) {
            throw new Error('Couldnt find the order') ;
        }      
        order.status = OrderStatus.Cancelled ;
        await order.save() ;
        msg.ack() ;
    }
}