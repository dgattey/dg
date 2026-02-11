import { toRenderableLink } from '../renderables/links';
import { toRenderableProject } from '../renderables/projects';
import { toRenderableRichTextContent } from '../renderables/richText';

describe('contentful renderables', () => {
  it('filters out links missing required fields', () => {
    expect(
      toRenderableLink({
        icon: null,
        title: 'Example',
        url: 'https://example.com',
      }),
    ).toEqual({
      icon: null,
      title: 'Example',
      url: 'https://example.com',
    });

    expect(toRenderableLink({ icon: null, title: null, url: 'https://example.com' })).toBeNull();
    expect(toRenderableLink({ icon: null, title: 'Example', url: null })).toBeNull();
  });

  it('filters out projects missing required fields', () => {
    const validProject = toRenderableProject({
      creationDate: '2024-01-01',
      description: { json: { content: [], nodeType: 'document' } },
      layout: 'default',
      link: { url: 'https://example.com' },
      thumbnail: {
        height: 480,
        url: 'https://example.com/image.webp',
        width: 640,
      },
      title: 'Project',
      type: ['Web'],
    });

    expect(validProject).toEqual({
      creationDate: '2024-01-01',
      description: { json: { content: [], nodeType: 'document' } },
      layout: 'default',
      link: { icon: null, title: 'Project', url: 'https://example.com' },
      thumbnail: {
        height: 480,
        url: 'https://example.com/image.webp',
        width: 640,
      },
      title: 'Project',
      type: ['Web'],
    });

    expect(toRenderableProject({ thumbnail: null, title: 'Missing image' })).toBeNull();
    expect(toRenderableProject({ thumbnail: null, title: null })).toBeNull();
  });

  it('filters invalid rich text links and assets', () => {
    const content = {
      json: { content: [], nodeType: 'document' },
      links: {
        assets: {
          block: [
            {
              height: 100,
              sys: { id: 'asset-good' },
              title: 'Asset',
              url: 'https://example.com/asset.webp',
              width: 100,
            },
            {
              height: 100,
              sys: { id: 'asset-bad' },
              title: 'Asset',
              url: null,
              width: 100,
            },
          ],
        },
        entries: {
          block: [
            {
              sys: { id: 'project-good' },
              thumbnail: {
                height: 480,
                url: 'https://example.com/image.webp',
                width: 640,
              },
              title: 'Project',
            },
            {
              sys: { id: 'project-bad' },
              thumbnail: { height: 480, url: null, width: 640 },
              title: 'Project',
            },
          ],
          inline: [
            {
              icon: null,
              sys: { id: 'link-good' },
              title: 'Link',
              url: 'https://example.com',
            },
            {
              icon: null,
              sys: { id: 'link-bad' },
              title: null,
              url: 'https://example.com',
            },
          ],
        },
      },
    };

    const renderable = toRenderableRichTextContent(content);

    expect(renderable.links.assets.block).toHaveLength(1);
    expect(renderable.links.assets.block[0]?.sys.id).toBe('asset-good');

    expect(renderable.links.entries.inline).toHaveLength(1);
    expect(renderable.links.entries.inline[0]?.sys.id).toBe('link-good');

    expect(renderable.links.entries.block).toHaveLength(1);
    expect(renderable.links.entries.block[0]?.sys.id).toBe('project-good');
  });
});
