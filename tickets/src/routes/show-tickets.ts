import express  , {Request , Response , NextFunction} from "express" ;
import Ticket from "../models/ticket-model";

const router = express.Router() ;
router.get('/api/tickets' ,
    async (req : Request , res : Response , next : NextFunction) => {
        const tickets = await Ticket.find({}) ;
        return res.status(200).json({tickets}) ;
    })


export {router as showTicketsRouter} ;