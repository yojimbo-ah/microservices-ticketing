import express , {Request , Response} from "express" ;
const router = express.Router() ;

router.post('/api/users/signout' , (req : Request , res : Response) => {
    (req as any).session = null ;
    res.status(200).json({}) ;
})

export {router as signOutRouter} ;