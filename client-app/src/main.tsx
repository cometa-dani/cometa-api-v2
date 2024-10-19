import ReactDOM from 'react-dom/client';
import './index.css';
import { router } from './app.router.tsx';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
