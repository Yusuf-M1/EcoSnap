import './globals.css';
import { Toaster } from 'sonner';

// We are using standard fonts for now to fix the crash
export const metadata = {
  title: 'EcoSnap',
  description: 'Track and report environmental issues',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}