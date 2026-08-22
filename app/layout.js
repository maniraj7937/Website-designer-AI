import "./globals.css";

export const metadata = {
  title: "AI Website Builder",
  description: "Chat with an AI agent that builds website files for you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
