interface QRCodeImageProps {
  value: string;
  size?: number;
}

export function QRCodeImage({ value, size = 180 }: QRCodeImageProps) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=png`;
  return (
    <img
      src={url}
      alt="QR Code"
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
