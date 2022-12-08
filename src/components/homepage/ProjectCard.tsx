import type { Project } from 'api/types/generated/contentfulApi.generated';
import type { ContentCardProps } from 'components/ContentCard';
import { ContentCard } from 'components/ContentCard';
import { cardSize } from 'components/ContentGrid';
import { HoverableContainer } from 'components/HoverableContainer';
import { useState } from 'react';
import styled from '@emotion/styled';
import {
  BREAKPOINTS_MIN_SIZES,
  PROJECT_2X_IMAGE_SIZES,
  PROJECT_IMAGE_SIZES,
} from 'constants/imageSizes';
import useBreakpoint from 'use-breakpoint';
import { Image } from 'components/Image';

type Props = Project & Pick<ContentCardProps, 'turnOnAnimation'>;

// Ensure on mobile, all cards are uniform height (small in height)
const Card = styled(ContentCard)`
  @media (max-width: 767.99px) {
    max-height: ${cardSize(1)};
  }
`;

/**
 * Uses the `ContentCard` to show a project's details
 */
export function ProjectCard({ title, layout, link, thumbnail, turnOnAnimation }: Props) {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  const [isHovered, setIsHovered] = useState(false);
  const { breakpoint } = useBreakpoint(BREAKPOINTS_MIN_SIZES, 'extraLarge');
  const width =
    horizontalSpan === 1 ? PROJECT_IMAGE_SIZES[breakpoint] : PROJECT_2X_IMAGE_SIZES[breakpoint];

  return (
    <Card
      verticalSpan={verticalSpan}
      horizontalSpan={horizontalSpan}
      link={link}
      overlay={title}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      turnOnAnimation={turnOnAnimation}
    >
      {thumbnail && (
        <HoverableContainer isHovered={isHovered}>
          <Image
            url={thumbnail.url}
            width={width}
            height={
              verticalSpan === 1
                ? PROJECT_IMAGE_SIZES[breakpoint]
                : PROJECT_2X_IMAGE_SIZES[breakpoint]
            }
            alt={title ?? 'Project image'}
            sizes={horizontalSpan === 1 ? PROJECT_IMAGE_SIZES : PROJECT_2X_IMAGE_SIZES}
          />
        </HoverableContainer>
      )}
    </Card>
  );
}
