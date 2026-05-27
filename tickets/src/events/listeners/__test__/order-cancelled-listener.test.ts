import { OrderCancelledListener } from "../order-cancelled-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledEvent } from "@ahabtickets/common";
import { Message } from "node-nats-streaming";
import Ticket from "../../../models/ticket-model"
import mongoose from "mongoose";
jest.mock('../../../nats-wrapper') ;

const setup = async () => {
    const orderCancelledListener = new OrderCancelledListener(natsWrapper.client) ;
    const orderId = new mongoose.Types.ObjectId().toHexString() ;
    const ticket = Ticket.build({
        title : 'best ticket' ,
        price : 23 ,
        userId : 'bdhasbdhahbsd' ,
    })
    ticket.orderId = orderId ;
    await ticket.save() ;

    const event : OrderCancelledEvent['data'] = {
        id : ticket.orderId! ,
        version : ticket.version ,
        ticket : {
            id : ticket._id.toString()
        }
    }

    //@ts-ignore
    const msg : Message = {
        ack : jest.fn()
    }
    return {
        event , 
        orderCancelledListener ,
        ticket ,
        msg
    }
}


it('deletes the order of the created ticket' , async () => {
    const {msg , event , orderCancelledListener , ticket} = await setup() ;
    await orderCancelledListener.onMessage(event , msg) ;
    const updatedTicket = await Ticket.findById(ticket._id) ;

    expect(updatedTicket!.orderId).toEqual(undefined) ;
})

it('message to have been acked' , async () => {
    const {msg , orderCancelledListener , event} = await setup() ;
    await orderCancelledListener.onMessage(event , msg) ;

    expect(msg.ack).toHaveBeenCalled() ;
})

it('publishes the event succusffuly' , async () => {
    const {msg , event , orderCancelledListener} = await setup() ;
    await orderCancelledListener.onMessage(event , msg) ;

    expect(natsWrapper.client.publish).toHaveBeenCalled() ;

    const publishedData = JSON.parse(
        //@ts-ignore
        natsWrapper.client.publish.mock.calls[0][1]
    )

    expect(publishedData.version).toEqual(expect.any(Number)) ;
})