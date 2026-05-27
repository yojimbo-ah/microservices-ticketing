import express , {Request , Response , NextFunction } from "express" ;
import {  BadRequestError, NotFoundError, requireAuth , validateRequest } from "@ahabtickets/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import Ticket from "../models/ticket-model";
import Order , { OrderStatus } from "../models/order-model";
import { natsWrapper } from "../nats-wrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created";
const EXPIRATION_TIME = 15 * 60 ;

const router = express.Router() ;
router.post('/api/orders' , 
    requireAuth ,
    [
        body('ticketId')
        .not()
        .isEmpty()
        .custom((input : string) => {
            return mongoose.Types.ObjectId.isValid(input) ;
        })
        .withMessage('Invalid ticket id') 
    ] ,
    validateRequest ,
    async (req : Request , res : Response , next : NextFunction) => {
        const ticketId = req.body.ticketId ;
        // find the ticket that the user trying to order in the database
        // return error if ticket not found
        const ticket = await Ticket.findById(ticketId) ;
        if (!ticket) {
            throw new NotFoundError() ;
        }

        // make sure that the ticket is availble for order (not reserved by other user)
        // search in all orders , and find a order where the ticker we just found and the order
        // status is not cancelled
        const reserved = await ticket.isReseved() ;
        if (reserved) {
            throw new BadRequestError('Cant create order , ticket already reserved') ;
        }
        // calculate exparition data (set default 15 min per example arbitrary in our case)
        const expiration = new Date() ;
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_TIME) ;
        // create the order with status awaiting paymeent and save to database
        const order = Order.build({
            expiresAt : expiration ,
            userId : req.currentUser!.id ,
            ticket : ticket ,
            status : OrderStatus.Created
        })
        await order.save() ;
        // publish event to other services that order has been created order:crearted
        const publisher = new OrderCreatedPublisher(natsWrapper.client) ;
        await publisher.publish({
            id : order._id.toString() ,
            userId : req.currentUser!.id ,
            status : OrderStatus.Created ,
            expiresAt : expiration.toISOString() , 
            version : order.version ,
            ticket : {
                id : ticket._id.toString() ,
                price : ticket.price
            }
        })
        res.status(201).json({order : order}) ;
    }
)


export {router as newOrderRouter} ;