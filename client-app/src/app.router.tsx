import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { CreateEvent, Home, Organization } from './pages/';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children:
      [
        { path: '', element: <Home /> },
        { path: 'organization/:id', element: <Organization /> },
        { path: 'event', element: <CreateEvent /> }
      ]
  }
]);
