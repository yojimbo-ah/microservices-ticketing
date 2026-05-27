import { Publisher ,  Subjects , OrderCreatedEvent} from "@ahabtickets/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject = Subjects.OrderCreated as const ;
}