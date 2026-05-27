import axios from "axios"

export default ({req}) => {
    if (typeof window === 'undefined') {
        // we are on the server side
    // in case of running from the server side
    // we are forwarding the request coming from the client side , to the server
    // auth server to more specific
    // client send cookie -> next.js sevrer forawrds it -> auth server express.js
    // -> reposnse back to next.js server form express.js ->
    // next.js response to the client computer with html files

    // when nextjs forwards the request headers to express server i mean he sends a
    // a request to the namespace of ngress-nginx wish will redirect it to
    // the express server to the route that should be redirected to 

        // we are on the server
        // there is no window variable on the server side (next.js server)
        // specifie the domain since it is running on the server
        // inginx doesnt know the source of it , it needs the host
        // so it can match it to the hosts the Loadbalancer has
        // so we can map it to our clusterip services 
        return  axios.create({
            baseURL : 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local' ,
            headers : req?.headers
        }) ;
    } else {
        // we are on the client side
        return axios.create({
            baseURL : '/' 
        })
    }
}