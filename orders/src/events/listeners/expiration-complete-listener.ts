import { Subjects , Listener , ExpirationCompleteEvent , OrderStatus } from "@ahabtickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { OrderCancelledPublisher } from "../publishers/order-cancelled";
import Order from "../../models/order-model";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    subject = Subjects.ExpirationComplete as const ;
    queueGroupName = queueGroupName ;
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message): Promise<void> {

        const order = await Order.findById(data.orderId) ;
        if (!order) {
            throw new Error('Couldnt find order') ;
        }
        if (order.status === OrderStatus.Complete) {
            // if the order was completed meaning the 
            // payment has been done then 
            // we dont cancel it we just leave the 
            // listner
            msg.ack()
            return ;
        }
        order.status = OrderStatus.Cancelled ;
        // we dont have to turn the ticket id into null 
        // beceause the isResearved method doesnt search
        // for cancelled orders
        await order.save() ;
        // we need to publish a new event to tell the 
        // other services that the ticket has been
        // unlocked and can be ordered again
        await new OrderCancelledPublisher(this.client).publish({
            id : order._id.toString() ,
            version : order.version ,
            ticket : {
                id : order.ticket.toString()
            }
        })
        msg.ack() ;
    }
}