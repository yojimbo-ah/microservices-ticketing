import axios from 'axios' ;
import { useState } from 'react';

export default ({url , method , body , onSuccess}) => {
    const [errors,setErrors] = useState(null) ;
    const doRequest = async () => {
        try {
            const result = await axios[method](url , body) ;
            onSuccess();
            return result.data ;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger">
                    <ul className="mb-0">
                        {err.response.data.errors.map((error, i) => (
                            <li key={i}>
                                {error?.field && (
                                    <strong>{error.field}: </strong>
                                )}
                                {error.message}
                            </li>
                        ))}
                    </ul>
                </div>
            ) ;
        }
    }

    return  {doRequest , errors}
}