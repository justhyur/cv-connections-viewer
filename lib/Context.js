import { createContext } from 'react';
import {useState, useEffect} from 'react';
import { useLocalStorage } from '../lib/useLocalStorage';
import { toast } from 'react-toastify';
import axios from "axios";

export const Context = createContext();

export const ContextProvider = ({children}) => {

    const toastOptions = {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    };

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const [isLoading, setIsLoading] = useState(false);

    const [serverToken, setServerToken] = useLocalStorage('serverToken', '');
    const [tokenLocked, setTokenLocked] = useLocalStorage('tokenLocked', false);

    const [filesList, setFilesList] = useLocalStorage('filesList', []);
    const [preferredNames, setPreferredNames] = useLocalStorage('preferredNames', {});
    
    const updateFilesList = () => {
        setIsLoading(true);
        const params = {
            token: serverToken,
        };
        const popup = toast.loading(`Updating list...`, toastOptions);
        axios.get(`${API_URL}/connections`, {params})
        .then((response) => {
            setFilesList({list: response.data.children, date: Date.now()});
            setPreferredNames(curr=>{
                const newNames = {...curr};
                response.data.children.forEach((c)=>{
                    const thisName = c.name.split('.')[1];
                    if(!newNames[thisName]){
                        newNames[thisName] = {
                            text: '',
                            locked: false,
                        };
                    }
                });
                return newNames;
            });
            setIsLoading(false);
            toast.update(popup, {
                ...toastOptions,
                render: `List updated.`, 
                type: "success", 
                isLoading: false,
            });
        })
        .catch(err => {
            console.error(err);
            setIsLoading(false);
            toast.update(popup, { 
                ...toastOptions, 
                render: `${err.response?.data ?? err.message}`, 
                type: "error", 
                isLoading: false,
            });
        });
    }

    useEffect(()=>{
        updateFilesList();
    },[])

    useEffect(()=>{
        console.log(preferredNames)
    },[preferredNames])

    return (
        <Context.Provider value={{
            isLoading, setIsLoading, updateFilesList,
            serverToken, setServerToken, tokenLocked, setTokenLocked,
            filesList, toastOptions, API_URL,
            preferredNames, setPreferredNames
        }}>
            {children}
        </Context.Provider>
    )
}