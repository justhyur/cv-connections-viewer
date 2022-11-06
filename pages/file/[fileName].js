import Head from 'next/head';
import {useState, useEffect, useContext} from 'react';
import { Context } from '/lib/Context';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import moment from 'moment';
import axios from 'axios';
import { useLocalStorage } from '/lib/useLocalStorage';
import { ToastContainer, toast } from 'react-toastify';

export default function Bank() {

const [isMounted, setIsMounted] = useState(false);
useEffect(()=>{
    setIsMounted(true);
},[]);
  
  const {
    serverToken, toastOptions, API_URL,
    preferredNames, setPreferredNames
  } = useContext(Context);

  const router = useRouter();

  const [fileName, setFileName] = useState(null);
  useEffect(()=>{
    if(router.isReady){
        setFileName(router.query.fileName)
    }
  },[router.isReady]);

  const [file, setFile] = useLocalStorage('file', null);
  const [fileLoaded, setFileLoaded] = useState(false);
  useEffect(()=>{
    console.log(file)
  },[file])

  useEffect(()=>{
    if(fileName && !fileLoaded){
        const params = {
            token: serverToken,
            fileName
        };
        const popup = toast.loading(`Loading file...`, toastOptions);
        axios.get(`${API_URL}/connection`, {params})
        .then((response) => {
            setFile(response.data);
            setFileLoaded(true);
            toast.update(popup, {
                ...toastOptions,
                render: `File loaded.`, 
                type: "success", 
                isLoading: false,
            });
        })
        .catch(err => {
            console.error(err);
            toast.update(popup, { 
                ...toastOptions, 
                render: `${err.response?.data ?? err.message}`, 
                type: "error", 
                isLoading: false,
            });
        });
    }
  },[fileName]);

  const [sIndex, setSIndex] = useState(0);
  const [pointI, setPointI] = useState(0);

  const numPerPage = 8;
  const navigate = (amount) => {
    if(amount < 0){
        amount = Math.abs(amount);
        setSIndex(curr=>curr-amount>0?curr-amount:0);
        setPointI(curr=>curr-amount>0?curr-amount:0);
    }else{
        setSIndex(curr=>curr+amount<file.length?curr+amount:file.length-1);
        setPointI(curr=>curr+numPerPage<file.length-amount?curr+amount:file.length-numPerPage-1);
    }
  }

  const htmlLog = (o) => {
    function isJSON(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    switch(typeof o){
        case "object":
            return <div className="object">
                <div className="empty">empty</div>
                {Object.entries(o).map( ([key, value]) => (<div className="value">
                    <div className={`key`}>
                        <span className="voice">{key}:</span>
                        {typeof value === 'object' && 
                            <span className="solid"></span>
                        }
                    </div>
                    {htmlLog(value)}
                </div>))}
            </div>;
        case "string":
            return isJSON(o)? htmlLog(JSON.parse(o)) : isNaN(o) ? <div className="string">{o}</div> : htmlLog(Number(o));
        case "number": case "boolean": 
            return <div className="number">{o}</div>;
        default:
            console.log(typeof o);
    }
  }

  if(fileName) return (
    <div className="container">
      <Head>
        <title>CV Connections Viewer - {fileName}</title>
        <meta name="description" content="Created with love" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isMounted &&
        <main className="main" style={{width:"100%"}}>
            <div className="sub-header">
                <div className={`input token`} style={{display:"flex", justifyContent:"center", marginBottom:".5em", flexWrap:"wrap"}}>
                  <span className={preferredNames[fileName]?.locked ? 'locked' : ''} onClick={()=>{
                    setPreferredNames(curr=>({...curr, [fileName]: {
                      ...curr[fileName],
                      locked: !curr[fileName].locked
                    }}));
                  }}>Preferred name: </span>
                  <input disabled={preferredNames[fileName]?.locked} type="text" value={preferredNames[fileName]?.text || ''} onChange={(e)=>{
                    setPreferredNames(curr=>({...curr, [fileName]: {
                      ...curr[fileName],
                      text: e.target.value
                    }}));
                  }}/>
                </div>
                <h3 style={{textAlign: "center"}}>{fileName}</h3>
            </div>
            <div className="navigator">
                {file?.length > numPerPage && <>
                    <div className="number" onClick={()=>{navigate(-5)}}>{'<<'}</div>
                    <div className="number" onClick={()=>{navigate(-1)}}>{'<'}</div>
                </>}
                {file?.map( (s, i) => i <= numPerPage && (
                    <div key={`num${i}`} className={`number ${pointI + i === sIndex? 'active' : ''}`} onClick={()=>{setSIndex(pointI + i)}}>{pointI + i}</div>
                ))}
                {file?.length > numPerPage && <>
                    <div className="number" onClick={()=>{navigate(1)}}>{'>'}</div>
                    <div className="number" onClick={()=>{navigate(5)}}>{'>>'}</div>
                </>}
            </div>
            <div className="file">
                <pre>{htmlLog(file[sIndex])}</pre>
            </div>
        </main>
      }
    </div>
  )
}