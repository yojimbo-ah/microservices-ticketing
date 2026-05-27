// i will not test for now because i am to tired to do it 
import { Message } from "node-nats-streaming";
import Ticket from "../../../models/ticket-model";
import { OrderCreatedListener } from "../order-created-listener"
import { OrderCreatedEvent , Subjects , OrderStatus} from "@ahabtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedPublisher } from "../../publishers/ticket-updated-publisher";

jest.mock('../../../nats-wrapper') ;
// create the setup function

const setup = async () => {
    const orderCreatedListener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title : 'great ticket' ,
        price : 23 ,
        userId : 'sjdajsajdnsaj'
    })

    await ticket.save() ;

    const event : OrderCreatedEvent['data'] = {
        id : 'akmsdkamkdmksa' ,
        userId : 'jansdjnandsn' ,
        status : OrderStatus.Created ,
        version : 0 ,
        expiresAt : new Date().toDateString() ,
        ticket : {
            id : ticket._id.toString() ,
            price : ticket.price
        }


    }
    //@ts-ignore
    const msg : Message = {
        ack : jest.fn()
    }

    return {
        orderCreatedListener ,
        ticket ,
        event ,
        msg
    }
}

it('returns the orderId to the order id from the order service ' , async () => {
    const {event , msg , ticket , orderCreatedListener} = await setup() ;
    await orderCreatedListener.onMessage(event , msg) ;
    
    const UpdatedTicket = await Ticket.findById(ticket._id) ;
    console.log(UpdatedTicket) ;
    expect(UpdatedTicket!.orderId).toBeDefined() ;
    console.log(UpdatedTicket!.orderId); 
    expect(UpdatedTicket!.orderId).toEqual(event.id) ;
})

it('acks the message ' , async () => {
    const {ticket , event , orderCreatedListener , msg} = await setup() ;
    await orderCreatedListener.onMessage(event , msg) ;
    expect(msg.ack).toHaveBeenCalled() ;

})

it('publishes the event succesffuly' , async () => {
    const {event , msg , ticket , orderCreatedListener} = await setup() ;
    await orderCreatedListener.onMessage(event , msg) ;

    expect(natsWrapper.client.publish).toHaveBeenCalled() ;

})