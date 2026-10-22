import {
  CUT_OUT_SHAPE_NAMES,
  CUT_OUT_SHAPES,
  cutOutSymbolId,
  PORTRAIT_OVAL_PATH,
} from './cutOutShapes';

const COLLAGE_PEBBLE_CLIP_ID = 'collage-pebble-clip';
const COLLAGE_DISC_CLIP_ID = 'collage-disc-clip';
const COLLAGE_PORTRAIT_CLIP_ID = 'collage-portrait-clip';
const COLLAGE_ROUGH_FILTER_ID = 'collage-rough';

export function CutOutSymbols() {
  return (
    <svg aria-hidden="true" className="cutSymbols" focusable="false" height="0" width="0">
      <defs>
        <clipPath clipPathUnits="objectBoundingBox" id={COLLAGE_PEBBLE_CLIP_ID}>
          <path d="M.3979 .0036c-.0526 .0039-.1219 .0186-.1683 .044c-.0218 .0119-.0416 .0272-.0611 .0425c-.0184 .0145-.0369 .0295-.0523 .0473c-.0283 .0326-.0445 .0749-.0618 .1139c-.0132 .0297-.0255 .0598-.0336 .0912c-.0165 .0639-.0256 .1803-.0161 .2454c.0069 .0471 .0241 .0993 .0454 .1418c.0293 .0587 .0757 .1046 .127 .1441c.0237 .0182 .0475 .0366 .0734 .0515c.0431 .0247 .1367 .059 .1856 .0665c.0295 .0046 .0596 .0047 .0894 .0055c.0286 .0008 .0574 .0022 .0859-.0002c.057-.0047 .1122-.0262 .1631-.0511c.0647-.0316 .1094-.0545 .1545-.1126c.0129-.0166 .0251-.0339 .0342-.0528c.0102-.0211 .0161-.0439 .0211-.0668c.016-.0744 .0119-.1149 .0047-.1891c-.005-.0511-.0098-.1015-.028-.1499c-.0284-.0754-.0525-.1143-.1036-.1759c-.0175-.0211-.0353-.0419-.0564-.0595c-.0239-.0199-.0508-.0361-.0769-.0529c-.0178-.0114-.0357-.0228-.0546-.0323c-.0439-.022-.1111-.0441-.1597-.0505c-.0369-.0049-.075-.0029-.1119-.0001z" />
        </clipPath>
        <clipPath clipPathUnits="objectBoundingBox" id={COLLAGE_DISC_CLIP_ID}>
          <path d="M.3861 .027c-.0866 .0227-.1671 .0681-.2292 .1328c-.1635 .1704-.1788 .4511-.0352 .6386c.0357 .0465 .0798 .0869 .1297 .1178c.0541 .0334 .1152 .0553 .178 .0653c.0641 .0102 .1299 .0073 .1928-.0091c.0556-.0146 .1083-.0394 .155-.073c.1288-.0927 .2104-.2512 .2073-.4105c-.0023-.1118-.0468-.2244-.1185-.3099c-.0337-.0403-.0742-.075-.1192-.1021c-.0514-.0309-.1086-.0513-.1678-.0604c-.0643-.0098-.13-.006-.1929 .0105z" />
        </clipPath>
        {/* Every joint's handles share one horizontal or vertical line, so the oval has no corners. */}
        <clipPath clipPathUnits="objectBoundingBox" id={COLLAGE_PORTRAIT_CLIP_ID}>
          <path d={PORTRAIT_OVAL_PATH} />
        </clipPath>
        <filter
          colorInterpolationFilters="sRGB"
          height="112%"
          id={COLLAGE_ROUGH_FILTER_ID}
          width="108%"
          x="-4%"
          y="-6%"
        >
          <feTurbulence baseFrequency=".04" numOctaves={2} seed={7} type="fractalNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            scale={3}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {CUT_OUT_SHAPE_NAMES.map((shape) => (
        <symbol id={cutOutSymbolId(shape)} key={shape} viewBox="0 0 400 400">
          <path d={CUT_OUT_SHAPES[shape]} />
        </symbol>
      ))}
    </svg>
  );
}
