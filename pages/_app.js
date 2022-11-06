import { ToastContainer } from 'react-toastify';
import Link from 'next/link';
import '../styles/globals.scss';
import 'react-toastify/dist/ReactToastify.css';
import { ContextProvider } from '/lib/Context';

function MyApp({ Component, pageProps }) {

  return(<>
      <header>
        <h1 className="title">
          <Link className="main-link" href="/"><b>CV Connections Viewer</b></Link>
        </h1>
      </header>
      <ContextProvider>
        <Component {...pageProps} />
      </ContextProvider>
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          theme="light"
        />
    </>
  ) 
}

export default MyApp
