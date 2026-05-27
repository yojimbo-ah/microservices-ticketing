import { Listener , PaymentCreatedEvent , Subjects , OrderStatus} from "@ahabtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import Order from "../../models/order-model";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
    queueGroupName = queueGroupName ;
    subject = Subjects.PaymentCreated as const ;
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
        
        const order = await Order.findById(data.orderId) ;
        if (!order) {
            throw new Error('Couldnt find the order') ;
        }
        order.status = OrderStatus.Complete ;
        await order.save() ;

        msg.ack() ;
    }
}