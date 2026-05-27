import express , {Request , Response , NextFunction} from "express" ;
import Ticket from "../models/ticket-model";
import { NotFoundError , BadRequestError, requireAuth , validateRequest , NotAuthorizedError} from "@ahabtickets/common";
import { param , body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router() ;
router.patch('/api/tickets/:ticketId' ,
    requireAuth ,
    [
        param('ticketId')
            .isMongoId()
            .withMessage('Invalid route ') ,
        body('title')
            .isLength({min : 6 ,max : 30})
            .withMessage('The title must be between 6 and 40 characters') ,
        body('price')
            .isFloat({ gt: 0 }) 
            .withMessage('Price must be greater than 0')
            .toFloat(),
    ] ,
    validateRequest ,
    async (req : Request , res : Response , nest : NextFunction) => {
        const {title , price} = req.body ;
        const ticketId = req.params.ticketId ;
        const ticket = await Ticket.findById(ticketId) ;
        if (!ticket) {
            throw new NotFoundError() ;
        }

        if (ticket.userId.toString() !== req.currentUser!.id) {
            throw new NotAuthorizedError() ;
        }
        if (ticket.orderId) {
            throw new BadRequestError('Cant edit the ticket,while it is locked') ;
        }
        ticket.price = price ;
        ticket.title = title ;
        await ticket.save() ;
        const publisher = new TicketUpdatedPublisher(natsWrapper.client) ;
        publisher.publish({
            title : ticket.title ,
            price : ticket.price ,
            id : ticket._id.toString() ,
            userId : ticket.userId ,
            version : ticket.version
        })
        
        res.status(200).json({ticket}) ;
    } 
)  


export {router as updateTicketrouter} ;