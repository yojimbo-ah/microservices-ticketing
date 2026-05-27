import Ticket from "../ticket-model";

it('implement optimistic concurency control' , async () => {
    const ticket = Ticket.build({
        title : 'gear title' ,
        price : 33 ,
        userId : 'jasjdsjajd'
    }) ;

    await ticket.save() ;
    const ticketInstance = await Ticket.findById(ticket._id) ;
    const ticketInstance2 = await Ticket.findById(ticket._id) ;
    if (!ticketInstance || !ticketInstance2) {
        throw new Error('kaskd') ;
    }
    ticketInstance.price = 10 ;
    await ticketInstance.save()
    ticketInstance2.price = 15 ;

    await expect(ticketInstance2.save()).rejects.toThrow() ; 

})