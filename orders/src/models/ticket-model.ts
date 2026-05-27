import mongoose , {Document , Model } from "mongoose";
import Order , { OrderStatus }  from "./order-model";
import { TicketCreatedEvent } from "@ahabtickets/common";
interface TicketAttrs {
    title : string ,
    price : number ,
    id : string
}

interface TicketModel extends Model<TicketDocument> {
    build(attrs : TicketAttrs) : TicketDocument
    findByEvent(event : {id : string , version : number}) : Promise<TicketDocument | null>
}

export interface TicketDocument extends Document {
    title : string ,
    price : number ,
    version : number
    isReseved () : Promise<Boolean>
}

const ticketSchema = new mongoose.Schema ({
    title : {
        type : String ,
        required : true
    } ,
    price : {
        type : Number ,
        required : true ,
        min : 0
    }
} , {
    toJSON : {
        transform (doc , ret : any) {
            ret.id = ret._id ;
            delete ret._id ;
        }
    } ,
    optimisticConcurrency : true
})

ticketSchema.set('versionKey' , 'version') ;
ticketSchema.statics.build = (attrs : TicketAttrs) => {
    return new Ticket({
        title : attrs.title ,
        price : attrs.price ,
        _id : attrs.id
    }) ;
}

ticketSchema.statics.findByEvent = async (event : {id : string , version : number}) => {
    const ticket = await Ticket.findOne({_id : event.id , version : event.version - 1}) ;
    return ticket ;
}

ticketSchema.methods.isReseved = async function () {
    const existingOrder = await Order.findOne({
        ticket : this._id ,
        status : {
            // this means search in all orders with that have one of the
            // following status
            $in: [OrderStatus.AwaitingPayment , OrderStatus.Complete , OrderStatus.Created]
        }
    })   
    return !!existingOrder ;
}

const Ticket = mongoose.model<TicketDocument , TicketModel>('Ticket' , ticketSchema) ;
export default Ticket  ;