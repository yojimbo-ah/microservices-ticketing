import { Publisher , PaymentCreatedEvent , Subjects } from "@ahabtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject = Subjects.PaymentCreated as const ;
}