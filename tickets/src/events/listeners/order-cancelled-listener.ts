import { Listener , OrderCancelledEvent , Subjects } from "@ahabtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/ticket-model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent>{
    subject = Subjects.OrderCancelled as const ;
    queueGroupName = queueGroupName ;
    async onMessage(data: OrderCancelledEvent['data'] , msg: Message): Promise<void> {
        const ticketId  = data.ticket.id ;
        
        const ticket = await Ticket.findById(ticketId) ;
        if (!ticket) {
            throw new Error('Couldnt find the ticket') ;
        }

        ticket.orderId = undefined ;

        await ticket.save() ;
        await new TicketUpdatedPublisher(this.client).publish({
            id : ticket._id.toString() ,
            price : ticket.price ,
            title : ticket.title ,
            userId :  ticket.userId ,
            version : ticket.version ,
            orderId : undefined 
        })
        msg.ack() ;
    }

}