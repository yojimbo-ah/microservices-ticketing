import { Publisher , Subjects , TicketUpdatedEvent } from "@ahabtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject = Subjects.TicketUpdated as const ;
}