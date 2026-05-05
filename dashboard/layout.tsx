import Script from 'next/script';
import 'dashboard-pkg/styles';
import './dashboard.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="lazyOnload"
      />
      {children}
    </>
  );
}
