import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #b5dce0 0%, #c9c0e8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            fontSize: "100px",
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          FP
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
