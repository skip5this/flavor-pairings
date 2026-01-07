import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Flavor Pairings - Discover what ingredients work well together";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Get the base URL for the image
  // In production, this should be your actual domain
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const bgImageUrl = `${baseUrl}/bg-image2.png`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f5ebe0",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background image */}
        <img
          src={bgImageUrl}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.6,
          }}
        />
        {/* Content overlay */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: 0,
              textShadow: "0 2px 4px rgba(255, 255, 255, 0.9)",
            }}
          >
            Flavor Pairings
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#8a8078",
              margin: 0,
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.7)",
            }}
          >
            Discover what ingredients work well together
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
