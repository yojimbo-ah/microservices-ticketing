import { Publisher , ExpirationCompleteEvent , Subjects} from "@ahabtickets/common";

export class OrderExpiredPublisher extends Publisher<ExpirationCompleteEvent>{
    subject = Subjects.ExpirationComplete as const ;
}