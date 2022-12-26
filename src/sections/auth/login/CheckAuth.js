import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth } from 'aws-amplify';
import { PropTypes } from "prop-types";
import { UserContext } from '../../../UserContext';

CheckAuth.propTypes = {
    children: PropTypes.object
}

export default function CheckAuth(props) {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [user, setUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        console.log(location.pathname)
        if (user) {  // we only want this logic to occur after user context is prepped
            if (user.username || location.pathname === '/login') {
                setContent(props.children);
            } else {
                navigate(`/login?dest=${encodeURIComponent(location.pathname)}`, { replace: true });
            }
        } else {
            // Set up the user context
            Auth.currentAuthenticatedUser().then((x) => {
                setUser(x)  // if an authenticated user is found, set it into the context
                console.log(x)
            }).catch(() => {
                setUser({ username: false })  // indicate the context is ready but user is not auth'd
                console.log("There wasn't an authenticated user found")
            });
        }
    }, [user, navigate, props.children, location.pathname])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {content}
        </UserContext.Provider>
    )
}
