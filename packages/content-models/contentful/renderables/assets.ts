import type { Asset, AssetWithSys } from '../schema/shared';

export type RenderableAsset = {
  url: string;
  width: number;
  height: number;
  title?: string | null;
};

export type RenderableAssetWithSys = RenderableAsset & {
  sys: {
    id: string;
  };
};

export const toRenderableAsset = (asset: Asset | null | undefined): RenderableAsset | null => {
  if (!asset?.url || asset.width == null || asset.height == null) {
    return null;
  }
  return {
    height: asset.height,
    title: asset.title ?? null,
    url: asset.url,
    width: asset.width,
  };
};

export const toRenderableAssetWithSys = (
  asset: AssetWithSys | null | undefined,
): RenderableAssetWithSys | null => {
  const renderable = toRenderableAsset(asset);
  if (!renderable || !asset?.sys?.id) {
    return null;
  }
  return {
    ...renderable,
    sys: { id: asset.sys.id },
  };
};
