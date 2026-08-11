import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, image }) {
  const siteName = "Arcane Bazaar";
  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} - Global Gaming Marketplace`;
  const desc =
    description ||
    "Buy and sell gaming accounts, currency, items, and boosting services across 135+ games. Secure escrow, instant delivery, 24/7 support.";
  const img = image || "/arcane-logo.png";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
