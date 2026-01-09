import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-indigo-950 via-purple-900 to-black text-white font-sans">
        {children}
      </body>
    </html>
  );
}
