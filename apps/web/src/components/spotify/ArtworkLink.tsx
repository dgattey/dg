import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Card } from '@mui/material';

type ArtworkImage = {
  height: number;
  width: number;
  url: string;
};

type ArtworkLinkProps = {
  href: string;
  title: string;
  image: ArtworkImage;
  imageSize: number;
  sizes: { extraLarge: number };
  cardSx: SxObject;
  hoverScale?: number;
};

export function ArtworkLink({
  href,
  title,
  image,
  imageSize,
  sizes,
  cardSx,
  hoverScale = 1.05,
}: ArtworkLinkProps) {
  const linkSx: SxObject = {
    '&:hover': { transform: `scale(${hoverScale})` },
    ...createBouncyTransition('transform'),
  };

  return (
    <Link href={href} isExternal={true} sx={linkSx} title={title}>
      <Card sx={cardSx}>
        <Image
          alt={title}
          {...image}
          fill={true}
          height={imageSize}
          sizes={sizes}
          width={imageSize}
        />
      </Card>
    </Link>
  );
}
