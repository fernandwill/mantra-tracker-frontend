import Image from "next/image";

interface OmLogoProps {
  className?: string;
}

export function OmLogo({ className }: OmLogoProps) {
  return (
    <Image
      src="/mantra-om-logo.svg"
      alt="Om Symbol"
      width={64}
      height={64}
      className={className}
    />
  );
}
