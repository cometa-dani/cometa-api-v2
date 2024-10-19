import { useEffect } from 'react';
import "preline/preline";
import { IStaticMethods } from "preline/preline";
import { Outlet } from 'react-router-dom';
import { Footer, Navbar } from './components';


declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}


export default function App(): JSX.Element {

  useEffect(() => {
    window.HSStaticMethods.autoInit();
  }, []);

  return (
    <div className='w-full h-full'>
      <Navbar />

      <div className='pt-32 sm:container mx-auto min-h-screen'>
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
