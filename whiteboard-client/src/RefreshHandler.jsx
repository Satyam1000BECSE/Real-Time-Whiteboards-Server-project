import {useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RefreshHandler({setIsAuthenticated}){
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(()=>{
        console.log("Location:", location.pathname);
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        if(localStorage.getItem('token')){
            setIsAuthenticated(true);
            if(location.pathname === '/' ||
                location.pathname === '/login' ||
                location.pathname === '/register'||
                location.pathname === ''
            ){
                navigate('/home', {replace: false});
            }
        }
    },[location, navigate, setIsAuthenticated]);

    return(
        null
    )
}

export default RefreshHandler;