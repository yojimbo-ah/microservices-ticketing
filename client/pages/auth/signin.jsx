import {  useState } from "react";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";
export default function Signup() {
    const [email ,setEmail] = useState('') ;
    const [password ,setPassword] = useState('') ;
    const {doRequest , errors} = useRequest({
        url : '/api/users/signin' ,
        body : {
            email , password
        } ,
        method : 'post' ,
        onSuccess: () => Router.push('/') 
    })
    const handleSubmit =  async (e) => {
        e.preventDefault() ;
        const result = await doRequest() ;
        console.log(result) ;
    }
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4">Sign In</h2>
                                {errors}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                    </div>
                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-primary">
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}