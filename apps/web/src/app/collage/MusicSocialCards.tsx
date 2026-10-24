import type { ReactNode } from 'react';
import { AlbumCoverBox } from './MusicStatsSocialCard';
import { PAPER_PALETTE } from './paperPalette';
import {
  type CutOutPiece,
  inkForTone,
  PAPER_SHADOW,
  type PaperColor,
  QUAD_A,
  SocialCardFrame,
  SocialCardHeadline,
  SocialCardMattedCard,
  SocialCardSplit,
  SocialCardStampRow,
  SocialCardTag,
} from './SocialCardParts';
import { SocialCardScallop } from './SocialCardScallop';

export type MusicHistoryCardVariant = {
  latestSummary: string | null;
  recentAlbums: ReadonlyArray<{
    albumName: string;
    artistNames: string;
    imageUrl: string | null;
    trackCount: number;
  }>;
  totalRecentTracks: number;
  variant: 'music-history';
};

export type FavoriteAlbumsCardVariant = {
  albums: ReadonlyArray<{
    artistNames: string;
    imageUrl: string | null;
    name: string;
    releaseYear: string | null;
  }>;
  totalCount: number;
  variant: 'favorite-albums';
};

const HISTORY_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  {
    color: 'vermilion',
    rotationDeg: -12,
    shape: 'birdpara',
    size: 240,
    underprint: 'cream',
    x: 455,
    y: -26,
  },
  { color: 'ultramarine', rotationDeg: 16, shape: 'seaweed', size: 240, x: -108, y: 310 },
  { color: 'leaf', rotationDeg: -24, shape: 'fern', size: 280, x: 960, y: -70 },
  { color: 'ochre', rotationDeg: 12, shape: 'coral', size: 175, x: 490, y: 445 },
  { color: 'rose', rotationDeg: -14, shape: 'heart', size: 78, x: 1068, y: 495 },
];

const ALBUMS_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'viridian', rotationDeg: 20, shape: 'philo', size: 320, x: 930, y: -80 },
  { color: 'olive', rotationDeg: -26, shape: 'banana', size: 300, x: -105, y: 315 },
  { color: 'vermilion', rotationDeg: 14, shape: 'gerbe', size: 210, x: 465, y: -44 },
  { color: 'rose', rotationDeg: -10, shape: 'trefoil', size: 140, x: 480, y: 458 },
  { color: 'ochre', rotationDeg: 10, shape: 'star4', size: 46, x: 1075, y: 265 },
];

const SLEEVE_TINTS: ReadonlyArray<PaperColor> = ['ultramarine', 'vermilion', 'ochre', 'viridian'];
const FAVORITE_TINTS: ReadonlyArray<PaperColor> = ['ochre', 'rose', 'vermilion', 'viridian'];
const GALLERY_SLOTS = [
  { left: 0, tiltDeg: -3.2, top: 0 },
  { left: 268, tiltDeg: 2.6, top: 10 },
  { left: 10, tiltDeg: 2.1, top: 256 },
  { left: 276, tiltDeg: -2.5, top: 248 },
] as const;

type GalleryAlbumTile = {
  artistNames: string;
  badge?: ReactNode;
  imageUrl: string | null;
  title: string;
};

function SocialCardAlbumGallery({
  items,
  tints,
}: {
  items: ReadonlyArray<GalleryAlbumTile>;
  tints: ReadonlyArray<PaperColor>;
}) {
  return (
    <div style={{ display: 'flex', height: 500, position: 'relative', width: 520 }}>
      {GALLERY_SLOTS.map((slot, index) => {
        const album = items[index];
        if (!album) {
          return null;
        }
        const matTone = tints[index % tints.length] ?? 'ochre';
        return (
          <div
            key={`${album.title}-${slot.left}-${slot.top}`}
            style={{
              background: PAPER_PALETTE[matTone],
              borderRadius: QUAD_A,
              boxShadow: PAPER_SHADOW,
              color: inkForTone(matTone),
              display: 'flex',
              flexDirection: 'column',
              left: slot.left,
              padding: 10,
              position: 'absolute',
              top: slot.top,
              transform: `rotate(${slot.tiltDeg}deg)`,
              width: 232,
            }}
          >
            <AlbumCoverBox fallbackTone={matTone} imageUrl={album.imageUrl} size={172} />
            <span
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.15,
                marginTop: 8,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {album.title}
            </span>
            <span
              style={{
                fontSize: 14,
                opacity: 0.84,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {album.artistNames}
            </span>
            {album.badge}
          </div>
        );
      })}
    </div>
  );
}

export function MusicHistorySocialCard({
  grainUrl,
  latestSummary,
  recentAlbums,
  totalRecentTracks,
}: MusicHistoryCardVariant & { grainUrl: string }) {
  return (
    <SocialCardFrame borderTone="cobalt" cutOuts={HISTORY_CUT_OUTS} grainUrl={grainUrl}>
      <SocialCardSplit>
        <div style={{ display: 'flex', flexDirection: 'column', width: 470 }}>
          <SocialCardStampRow gap={14} marginBottom={20} stampWidth={116}>
            <SocialCardTag tiltDeg={2.2} tone="ochre">
              <span>{totalRecentTracks} recent plays</span>
            </SocialCardTag>
          </SocialCardStampRow>
          <SocialCardHeadline fontSize={94} headline="Listening history" indentEm={0.36} />
          {latestSummary ? (
            <SocialCardMattedCard
              matTiltDeg={2.2}
              matTone="vermilion"
              style={{ marginTop: 26, width: 440 }}
              tiltDeg={-1.5}
            >
              <span
                style={{
                  color: PAPER_PALETTE.cobalt,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                RECENTLY SPINNING ON SPOTIFY
              </span>
              <span
                style={{
                  fontSize: 25,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.18,
                }}
              >
                {latestSummary}
              </span>
            </SocialCardMattedCard>
          ) : null}
        </div>
        <SocialCardAlbumGallery
          items={recentAlbums.map((album, index) => ({
            artistNames: album.artistNames,
            badge: (
              <div
                style={{
                  background: PAPER_PALETTE.cream,
                  borderRadius: 10,
                  boxShadow: PAPER_SHADOW,
                  color: PAPER_PALETTE.ink,
                  display: 'flex',
                  fontSize: 14,
                  fontWeight: 700,
                  padding: '4px 10px',
                  position: 'absolute',
                  right: -8,
                  top: -10,
                  transform: `rotate(${index % 2 === 0 ? 7 : -7}deg)`,
                }}
              >
                {`${album.trackCount} ${album.trackCount === 1 ? 'play' : 'plays'}`}
              </div>
            ),
            imageUrl: album.imageUrl,
            title: album.albumName,
          }))}
          tints={SLEEVE_TINTS}
        />
      </SocialCardSplit>
    </SocialCardFrame>
  );
}

export function FavoriteAlbumsSocialCard({
  albums,
  grainUrl,
  totalCount,
}: FavoriteAlbumsCardVariant & { grainUrl: string }) {
  const artistPreview = [
    ...new Set(
      albums
        .map((album) => album.artistNames.split(',')[0]?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  ]
    .slice(0, 3)
    .join(' · ');
  return (
    <SocialCardFrame borderTone="ochre" cutOuts={ALBUMS_CUT_OUTS} grainUrl={grainUrl}>
      <SocialCardSplit>
        <div style={{ display: 'flex', flexDirection: 'column', width: 470 }}>
          <SocialCardStampRow stampWidth={116}>
            <SocialCardScallop kind="sticker" size={112} tiltDeg={8} tone="viridian">
              <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{totalCount}</span>
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>on the shelf</span>
            </SocialCardScallop>
          </SocialCardStampRow>
          <SocialCardHeadline fontSize={98} headline="Favorite albums" indentEm={0.42} />
          {artistPreview ? (
            <SocialCardMattedCard
              matTiltDeg={2}
              matTone="rose"
              style={{ marginTop: 24, width: 440 }}
              tiltDeg={-1.6}
            >
              <span
                style={{
                  color: PAPER_PALETTE.vermilion,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                RECORD CRATE FAVORITES
              </span>
              <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {artistPreview}
              </span>
            </SocialCardMattedCard>
          ) : null}
        </div>
        <SocialCardAlbumGallery
          items={albums.map((album) => ({
            artistNames: album.artistNames,
            imageUrl: album.imageUrl,
            title: album.name,
          }))}
          tints={FAVORITE_TINTS}
        />
      </SocialCardSplit>
    </SocialCardFrame>
  );
}
