describe('opengraph-image', () => {
  it('uses the shared helper with homepage values', async () => {
    jest.resetModules();
    const createSocialImage = jest.fn();
    jest.doMock('../createSocialImage', () => ({
      createSocialImage,
    }));

    const { HOMEPAGE_TITLE, SITE_NAME } = await import('../metadata');
    const { SOCIAL_IMAGE_SIZE } = await import('../createSocialImage');
    const { default: Image, size } = await import('../opengraph-image');

    Image();

    expect(createSocialImage).toHaveBeenCalledWith('/opengraph-image', HOMEPAGE_TITLE, SITE_NAME);
    expect(size).toEqual(SOCIAL_IMAGE_SIZE);
  });
});
