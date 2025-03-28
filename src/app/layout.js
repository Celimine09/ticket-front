import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
            <head>
        {/* ลองเพิ่มบรรทัดนี้ */}
        <link rel="stylesheet" href="/globals.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}