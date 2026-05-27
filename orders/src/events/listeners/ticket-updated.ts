import { Listener , Subjects, TicketUpdatedEvent } from "@ahabtickets/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/ticket-model";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject = Subjects.TicketUpdated as const ;
    queueGroupName = queueGroupName ;
    async onMessage(data: TicketUpdatedEvent['data'] , msg: Message): Promise<void> {
        const {title , price } = data ;
        const ticket = await Ticket.findByEvent(data) ;
        if (!ticket) {
            throw new Error('Couldnt find the ticket') ;
        }
        ticket.price = price ;
        ticket.title = title ;
        
        await ticket.save() ;
        msg.ack() ;
    }
}