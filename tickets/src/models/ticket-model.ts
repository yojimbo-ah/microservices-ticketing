import mongoose , {Document , Model } from "mongoose";


// must add status of the ticket here so the listener can update it later
interface TicketAttrs {
    title : string 
    price : number
    userId : string
}

interface TicketModel extends Model<TicketDocument> {
    build(attrs : TicketAttrs) : TicketDocument
}

interface TicketDocument extends Document {
    title : string 
    price : number
    userId : string
    version : number
    orderId ?: string
}

// the orderId field will be used to fetch data from the order server, since 
// it already has a built in route for fetching it , plus it will be undefined
// until an order is associated with the ticket

const ticketSchema = new mongoose.Schema ({
    title : {
        type : String ,
        required : true 
    } ,
    price : {
        type : Number ,
        required : true
    } ,
    userId : {
        type : String ,
        required : true
    } ,
    orderId : {
        type : String  ,
        required : false
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
    return new Ticket(attrs) ;
}

const Ticket = mongoose.model<TicketDocument , TicketModel>('Ticket' , ticketSchema) ;
export default Ticket  ;