import { TicketUpdatedListener } from "../ticket-updated"
import { TicketCreatedListener } from "../ticket-created"
import { TicketUpdatedEvent , TicketCreatedEvent} from "@ahabtickets/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"

import { natsWrapper } from "../../../nats-wrapper"
import Ticket from "../../../models/ticket-model"
jest.mock('../../../nats-wrapper') ;

const setup = async () => {
    // create the listener
    const listener = new TicketUpdatedListener(natsWrapper.client) ;
    const ticket = Ticket.build({
        title : 'concert' ,
        price : 10 ,
        id : new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save() ;
    const dataEvent : TicketUpdatedEvent['data'] = {
        title : 'not concert' ,
        price : 15 ,
        id : ticket._id.toString() ,
        version : ticket.version + 1 ,
        userId : new mongoose.Types.ObjectId().toString()

    }
    //@ts-ignore
    const msg : Message = {
        ack : jest.fn()
    }

    return {
        msg , dataEvent , listener , ticket
    }
}

it('it finds , updated and saves a ticket' , async () => {
    const {msg , dataEvent , listener , ticket} = await setup() ;

    await listener.onMessage(dataEvent,msg) ;
    const ticket1 = await Ticket.findById({
        _id : dataEvent.id ,
        version : dataEvent.version
    }) ;
    console.log(ticket1) ;
    expect(ticket1).toBeDefined() ;
    expect(ticket1!.price).toEqual(15) ;

}) ;

it('acks the message ' , async () => {
    const {msg , dataEvent , listener , ticket} = await setup() ;
    await listener.onMessage(dataEvent,msg) ;

    expect(msg.ack).toHaveBeenCalled()

})

it('doesnt call ack if the event has a skipped version number' , async () => {
    const {msg , dataEvent, listener} = await setup() ;
    //this test will test out of order event , will 
    // return if the version is not right ( out order )
    dataEvent.version = 5 ;
    try {
        await listener.onMessage(dataEvent,msg)
    } catch (error) {
        return;
    }

    expect(msg.ack).not.toHaveBeenCalled() ;
})