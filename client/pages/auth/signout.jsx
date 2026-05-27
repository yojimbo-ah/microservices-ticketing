import { useEffect } from "react"
import useRequest from "../../hooks/useRequest"
import Router from "next/router"

export default () => {
    const {doRequest} = useRequest({
        url : '/api/users/signout' ,
        body : {} ,
        onSuccess : () => {
            setTimeout(Router.push('/') , 1500) ;
        } ,
        method : 'post'
    })
    useEffect(() => {
        doRequest() ;
    }, [])

    return <div>
        signing you out...
    </div>
}