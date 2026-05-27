import request from "supertest"
import { TicketCreatedListener } from "../ticket-created"
import { TicketCreatedEvent } from "@ahabtickets/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"

import { natsWrapper } from "../../../nats-wrapper"
import Ticket from "../../../models/ticket-model"
jest.mock('../../../nats-wrapper') ;

const setup = async () => {
    // ceeates a instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client) ;
    // creates a fake data event
    const dataEvent : TicketCreatedEvent['data'] = {
        id : new mongoose.Types.ObjectId().toHexString() ,
        title : 'concert' ,
        price : 10 ,
        userId : 'jasjdsjajd' ,
        version : 0
    }

    // create a fake Mssage Obj
    //@ts-ignore
    const msg : Message = {
        ack : jest.fn()
    }

    return {
        listener ,
        dataEvent ,
        msg
    }
}

it('creates and saves a ticket' , async () => {
    const {listener , dataEvent , msg} = await setup() ;
    // call the onMessage function on the data object
    await listener.onMessage(dataEvent , msg) ;

    // write assertion to make sure the message ticket was created

    const ticket = await Ticket.findById(dataEvent.id) ;
    expect(ticket).toBeDefined()     
    expect(ticket!.title).toEqual(dataEvent.title);
    expect(ticket!.price).toEqual(dataEvent.price) ;
})

it('ack the messages' , async () => {
    const {listener , dataEvent , msg} = await setup() ;
    // call the onMessage function on the data object
    await listener.onMessage(dataEvent,msg) ;
    
    // write assertion to make ack function is called
    expect(msg.ack).toHaveBeenCalled() ;
})