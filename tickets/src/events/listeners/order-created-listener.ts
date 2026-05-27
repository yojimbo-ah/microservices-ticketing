import { Listener , Subjects , OrderCreatedEvent , TicketUpdatedEvent} from "@ahabtickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/ticket-model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject = Subjects.OrderCreated as const ;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'] , msg: Message): Promise<void> {
        // the logique for hiding the ticket while it beign treated by 
        // the orders or payement service 
        const { status , id  } = data ;
        const ticketId = data.ticket.id ;
        const ticket = await Ticket.findById(ticketId) ; 
        if (!ticket) {
            throw new Error('Couldnt find ticket') ;
        }
        // the id here is the order id 
        // we will use it to fetch the data from the 
        // order service
        ticket.orderId = id ;
        await ticket.save() ;
        await new TicketUpdatedPublisher(this.client).publish({
            title : ticket.title ,
            id : ticket.id.toString() ,
            price : ticket.price ,
            version : ticket.version ,
            orderId : id ,
            userId : data.userId
        })

        msg.ack() ;
    }
}