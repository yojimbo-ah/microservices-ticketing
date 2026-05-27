import express , { Request , Response , NextFunction } from "express" ;
import { requireAuth , validateRequest } from "@ahabtickets/common";
import { body } from "express-validator";
import Ticket from "../models/ticket-model";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router() ;


router.post('/api/tickets' , 
    requireAuth ,
    [
        body('title')
        .isLength({min : 6 , max : 30})
        .withMessage('The title mus be between 6 and 30 characters') ,
        body('price')
        .isFloat({ gt: 0 }) 
        .withMessage('Price must be greater than 0')
        .toFloat(),
    ] ,
    validateRequest , 
    async (req : Request , res : Response , next : NextFunction) => {
        const {title , price} = req.body ;
        // creating new ticket and the attaching refrence to user
        const ticket = Ticket.build({title , price , userId : req.currentUser?.id!})
        await ticket.save() ;

        const publisher = new TicketCreatedPublisher(natsWrapper.client) ;
        publisher.publish({
            id : ticket._id.toString() ,
            title : ticket.title ,
            price : ticket.price ,
            userId : ticket.userId ,
            version : ticket.version
        })
        res.status(201).json({ticket}) ;
})


export {router as newTicketRouter} ;