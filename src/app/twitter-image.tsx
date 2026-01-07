import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Flavor Pairings - Discover what ingredients work well together";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
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
            }}
          >
            Flavor Pairings
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#8a8078",
              margin: 0,
            }}
          >
            Discover what ingredients work well together
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                background: "#b5dce0",
                padding: "16px 32px",
                borderRadius: "16px",
                fontSize: "24px",
                color: "#1a1a1a",
              }}
            >
              Apples
            </div>
            <div
              style={{
                background: "#c9c0e8",
                padding: "16px 32px",
                borderRadius: "16px",
                fontSize: "24px",
                color: "#1a1a1a",
              }}
            >
              Cinnamon
            </div>
            <div
              style={{
                background: "#b5dce0",
                padding: "16px 32px",
                borderRadius: "16px",
                fontSize: "24px",
                color: "#1a1a1a",
              }}
            >
              Nutmeg
            </div>
            <div
              style={{
                background: "#c9c0e8",
                padding: "16px 32px",
                borderRadius: "16px",
                fontSize: "24px",
                color: "#1a1a1a",
              }}
            >
              Butter
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
