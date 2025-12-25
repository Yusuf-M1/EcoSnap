import './globals.css';

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
      </body>
    </html>
  );
}