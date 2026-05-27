import express , {Request , Response , NextFunction, response} from "express" ;
import app from "../app";
import Ticket from "../models/ticket-model";
import { param } from "express-validator";
import { validateRequest , NotFoundError } from "@ahabtickets/common";


const router = express.Router() ;

router.get('/api/tickets/:ticketId' , 
    [
        param('ticketId')
        .isMongoId()
        .withMessage('Invalid ticket id')
    ] ,
    validateRequest ,
    async (req : Request , res : Response , next : NextFunction) => {
        const ticketId = req.params.ticketId ;
        const ticket = await Ticket.findById(ticketId) ;
        if (!ticket) {
            throw new NotFoundError() ;
        }

        res.status(200).json({ticket}) ;
    }
)



export {router as showTicketRouter}