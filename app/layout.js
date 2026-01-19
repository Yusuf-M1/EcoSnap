import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../context/ThemeContext';

export const metadata = {
  title: 'EcoSnap - Report Environmental Issues',
  description: 'Track and report environmental issues in your community. Snap photos, report waste, and help make your city cleaner.',
  keywords: 'environmental reporting, waste management, community cleanup, eco tracking',
  authors: [{ name: 'EcoSnap Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ecosnap-theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}