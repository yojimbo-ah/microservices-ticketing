import { Publisher , Subjects , TicketCreatedEvent } from "@ahabtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject = Subjects.TicketCreated as const ;
}

