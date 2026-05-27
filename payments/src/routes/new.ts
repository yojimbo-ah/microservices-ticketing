import express , {Request , Response , NextFunction} from "express" ;
import { NotAuthorizedError, NotFoundError, OrderStatus,
    requireAuth , validateRequest , } from "@ahabtickets/common";
import { body } from "express-validator";
import Order from "../models/order";
import { stripe } from "../stripe";
import Payment from "../models/payment";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router() ;

router.post('/api/payments' ,
    requireAuth ,
    [
        body('orderId').isString().withMessage('the id should be a string')
        .notEmpty() ,
        body('token').notEmpty()
    ] ,
    validateRequest ,
    async (req : Request , res : Response , next : NextFunction) => {
        const {token , orderId} = req.body ;
        const order = await Order.findById(orderId) ;
        if (!order) {
            throw new NotFoundError() ;
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError() ;
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new Error('Order has been cancelled') ;
        }

        const payment = await stripe.charges.create({
            amount : order.price * 100 , // convert to cent
            currency : 'usd' ,
            source : token
        })
        const charge = Payment.build({
            orderId : orderId ,
            stripeId : payment.id.toString()
        })

        await charge.save() ;

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id : charge._id.toString() ,
            orderId : charge.orderId.toString() ,
            stripeId : charge.stripeId.toString()
        })

        res.status(200).json({
            message : "charges was created succesfully" ,
            charge
        }) ;
    }
 )



export {router as newPaymentRouter} ;