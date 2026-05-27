import { Subjects , OrderCancelledEvent , Publisher } from "@ahabtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject = Subjects.OrderCancelled as const ;
}