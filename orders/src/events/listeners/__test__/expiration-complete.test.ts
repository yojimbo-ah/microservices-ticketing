import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteEvent , OrderStatus} from "@ahabtickets/common";
import Order from "../../../models/order-model";
import Ticket from "../../../models/ticket-model";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose" ;
jest.mock('../../../nats-wrapper') ;


const setup = async () => {
    const listener = await new ExpirationCompleteListener(natsWrapper.client) ;
    const ticket = Ticket.build({
        id : new mongoose.Types.ObjectId().toHexString() ,
        price : 23 ,
        title : 'great title'
    }) ;
    const expiresAtS = new Date().getSeconds() + 10
    const expiresAt = new Date(expiresAtS)
    await ticket.save() ;
    const order = Order.build({
        userId : 'kasdmaksd' ,
        ticket : ticket ,
        status : OrderStatus.Created ,
        expiresAt : expiresAt
    })
    await order.save() ;
    const event : ExpirationCompleteEvent['data'] = {
        orderId : order._id.toString()
    }

    //@ts-ignore
    const msg : Message = {
        ack : jest.fn()
    }
    return {
        msg ,
        event ,
        listener ,
        order ,
        ticket
    }
}

it('expires the order and turns ot status into cancelled' , async () => {
    const {event , listener , order , ticket , msg} = await setup() ;
    await listener.onMessage(event , msg) ;
    const updatedOrder = await Order.findById(order._id) ;
    console.log(updatedOrder) 
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled) ;

})

it('it publishes the event' , async () => {
    const {event , msg , order , listener} = await setup() ;
    await listener.onMessage(event , msg) ;

    expect(natsWrapper.client.publish).toHaveBeenCalled() 

})

it('it acks the event' , async () => {
    const {event , msg , order , listener} = await setup() ;
    await listener.onMessage(event , msg) ;

    expect(msg.ack).toHaveBeenCalled() ;
})