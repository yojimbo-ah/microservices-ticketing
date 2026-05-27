import { Listener , TicketCreatedEvent , Subjects} from "@ahabtickets/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../models/ticket-model";
import { queueGroupName } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject = Subjects.TicketCreated as const ;
    queueGroupName = queueGroupName ;
    async onMessage(data: TicketCreatedEvent['data'] , msg: Message): Promise<void> {
        const {title, price , id} = data ;
        const ticket = Ticket.build({
            title ,
            price ,
            id
        })
        await ticket.save() ;
        msg.ack() ;
    }
}