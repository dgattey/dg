import { safeParse } from 'valibot';
import { footerLinksResponseSchema } from '../schema/footer';
import { introBlockResponseSchema } from '../schema/intro';
import { currentLocationResponseSchema } from '../schema/location';
import { projectsResponseSchema } from '../schema/projects';

describe('contentful schemas', () => {
  it('parses intro block responses', () => {
    const input = {
      asset: {
        __typename: 'Asset',
        height: 660,
        title: 'Intro image',
        url: 'https://example.com/intro.webp',
        width: 660,
      },
      textBlockCollection: {
        __typename: 'TextBlockCollection',
        items: [
          {
            content: {
              json: { content: [], nodeType: 'document' },
              links: { assets: { block: [] }, entries: { block: [], inline: [] } },
            },
          },
        ],
      },
    };

    expect(safeParse(introBlockResponseSchema, input).success).toBe(true);
  });

  it('parses footer link responses', () => {
    const input = {
      sectionCollection: {
        __typename: 'SectionCollection',
        items: [
          {
            blocksCollection: {
              items: [{ icon: null, title: 'Link', url: 'https://example.com' }],
            },
          },
        ],
      },
    };

    expect(safeParse(footerLinksResponseSchema, input).success).toBe(true);
  });

  it('parses project list responses', () => {
    const input = {
      projectCollection: {
        __typename: 'ProjectCollection',
        items: [
          {
            __typename: 'Project',
            creationDate: '2024-01-01',
            description: { json: { content: [], nodeType: 'document' } },
            layout: 'default',
            link: { url: 'https://example.com' },
            thumbnail: { height: 480, url: 'https://example.com/image.webp', width: 640 },
            title: 'Project',
            type: ['Web', 'OpenSource'],
          },
        ],
      },
    };

    expect(safeParse(projectsResponseSchema, input).success).toBe(true);
  });

  it('parses current location responses', () => {
    const input = {
      contentTypeLocation: {
        __typename: 'Location',
        image: { height: 170, url: 'https://example.com/map.webp', width: 170 },
        initialZoom: 8,
        point: { latitude: 37.5, longitude: -122.4 },
        zoomLevels: [6, '8', 10],
      },
      darkImage: { url: 'https://example.com/dark.webp' },
      lightImage: { url: 'https://example.com/light.webp' },
    };

    expect(safeParse(currentLocationResponseSchema, input).success).toBe(true);
  });
});
