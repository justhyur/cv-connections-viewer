import Head from 'next/head';
import {useState, useEffect, useContext} from 'react';
import { Context } from '../lib/Context';
import Link from 'next/link';
import moment from 'moment';

export default function Home() {

  const [isMounted, setIsMounted] = useState(false);
  useEffect(()=>{
    setIsMounted(true);
  },[]);

  const {
    isLoading, updateFilesList,
    serverToken, setServerToken, tokenLocked, setTokenLocked,
    filesList, preferredNames, setPreferredNames
  } = useContext(Context);

  return (
    <div className="container">
      <Head>
        <title>CV Connections Viewer</title>
        <meta name="description" content="Created with love" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isMounted &&
        <main>
          <div className="token">
            <span className={tokenLocked ? 'locked' : ''} onClick={()=>{setTokenLocked(t=>!t)}}>Server Token</span>
            <input disabled={tokenLocked} type="text" value={serverToken} onChange={(e)=>{setServerToken(e.target.value)}}/>
          </div>
          {filesList.date && <div style={{marginTop: "1rem"}} className="text-center"><b>Last update:</b> {moment(filesList.date).format("DD/MM/YYYY HH:mm")}</div>}
          <div className="buttons">
            <button disabled={isLoading} className="button" onClick={updateFilesList}>Update list</button>
          </div>
          <div className="files-list">
            {filesList.list?.map( (file, i) => (
              <div key={`file${i}`} className="file-name">
                <div className={`input token`}>
                  <span className={preferredNames[file.name.split('.')[1]]?.locked ? 'locked' : ''} onClick={()=>{
                    setPreferredNames(curr=>({...curr, [file.name.split('.')[1]]: {
                      ...curr[file.name.split('.')[1]],
                      locked: !curr[file.name.split('.')[1]].locked
                    }}));
                  }}>Preferred name: </span>
                  <input disabled={preferredNames[file.name.split('.')[1]]?.locked} type="text" value={preferredNames[file.name.split('.')[1]]?.text || ''} onChange={(e)=>{
                    setPreferredNames(curr=>({...curr, [file.name.split('.')[1]]: {
                      ...curr[file.name.split('.')[1]],
                      text: e.target.value
                    }}));
                  }}/>
                </div>
                <Link className="button small" href={`/file/${file.name.split('.')[1]}`}><pre>{file.name.split('.')[1]}</pre></Link>
              </div>
            ))}
          </div>
        </main>
      }

    </div>
  )
}
