import express from "express" ;
import 'express-async-errors';
import { errorHandler , NotFoundError , currentUser} from "@ahabtickets/common" ;
import cookieSession from "cookie-session";

import { showTicketRouter } from "./routes/show-ticket";
import { newTicketRouter } from "./routes/new";
import { showTicketsRouter } from "./routes/show-tickets";
import { updateTicketrouter } from "./routes/update-ticket";
const app = express() ;

app.set('trust proxy' , true) ;
app.use(express.json()) ;

app.use(
    cookieSession({
        signed : false ,
        secure : false ,
    })
)

app.use(currentUser) ;
app.use(updateTicketrouter) ;
app.use(showTicketsRouter) ;
app.use(showTicketRouter) ;
app.use(newTicketRouter) ;


app.all('*' , async () => {
    throw new NotFoundError() ;
})
app.use(errorHandler) ; 

export default app ;