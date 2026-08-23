import {
  CARD_ROUTE_PADDING,
  decodePolyline,
  fitRouteViewport,
  projectRouteToPixels,
  toSvgPath,
} from '../routeGeometry';

const OSRM_GGP =
  'gbneFhssjV]@]@E?Q@A?A?Q@C?iIVS?S@iIVC?K?Q@?R@XDdC@t@FdD?BHlFHtEHtEFzD?F?P@TF`EHtEHtEFtE@RF`EFbE@P@R?`@F`DBnA?N?N?fA?D?X@Z?NB|A?B@H?BAB?BABABA@A@C?C@E?O@I?KAK?K?KAg@?o@A]A[A]A]AYA[?]?]?[?[?]@Y@Y@[@[BY@SBG?M@I@UBG@M@MBM@E@SBa@F_@Dg@HWBQBYDYD[BYBYBYB[B[BYBG?S@[BUBW@U@Y@[BQ@U@_@BY@F\\LAH?D?FALAJ?LA\\Bj@BN?LBJBPALA^Et@EH?ZCdBKJAA]AIb@GnC]D?DANCJALCFARCJALARCJALALALALAL?JALAXAXAD?F?JAL?L?NAV?Z@Z?X@Z@Z@Z@XBP?V?b@A\\@N@N?L?J?PAPAD?D?BAFCBABCDE@CBE@E@G?GAm@AYAq@?C?AAU?UIaEL?B?lIWPARAlIUNAB?@?NAvGQHAh@ATAXAzIWrJYbAET?`GSB?T?PAD?zIW|IYTAV?fIWTAV?dIWTAVArCIhEM?Z@J?RNAlIk@B?FATADAD?fBMtAKb@E^IhAGNA~Ii@RCPAfDUxDYd@CRARCD?D?NA?rA?XAT?BA^?P@FBDBDD@D???D?DABABC@G@G?U?WAGASC[?wA?cA?g@?k@?S?O?uA?cC?iA?iB?M]@S@S?AY?AC_AVATB?P?NAR?J@T?L?dA?jB?T?bE?RAR?dA?LAV?J?`@O@E?E?SBS@e@ByDXgDTQ@SB_Jh@O@iAF_@Hc@DuAJgBLE?E@U@G@C?mIj@O@?SAK?[iELsCHW@U@eIVW?U@gIVW?U@}IX{IVE?Q@U?C?aGRU?cADsJX{IVY@U@i@@I@wGPO@A?C?O@mITS@Q@mIVC?M?E_DAa@@SASGcEG_EAUIuEGuEIuEGyD?GASQ?K@C?e@?C?I?K@I@I@E?K@K?MAKAKAKCKGKEKIIGIIIIEEIIILINCDCFOt@CPAPMr@Yj@k@z@SZMRLSLSDGj@{@Xk@Ls@@QBQNu@BGBEHOHMHHDDHHHHHFJHJDJFJBJ@J@L@J?JAD?HAHAJAH?B?d@?B?JAP??SIaEGuEIwEG{DAY?YGeD???UIcE?QGwD?CAY?QCw@CwBAUGsEIcE?SIuE?QAk@EeCAQGuEIcE?QAw@G_DGaEASAgAEmCG{DAE?SIuEGsD?Q?OIeEISAQAkA?SAQAe@?QAW?S?UR?@?R??R?PS@U@S?aADI?E?Q@ASAKAME_@C[G_@E]E]E_@E]E]G[EYG[EYI_@WwAWsAUmAUoAKc@GQEOGMGMCGCEACEGKIIIIGGGIGMGMEMEOEKCu@KSCSESGSIQMMKMMKQMQIOIQGQEQGQCSEUCWC]A[A]A[?[?W?[?Y@S?I@Q?OBM@SDYBWF[Fa@DQFYHUHWHWJSDI`AsB`AuBBEDMCECEEEACeAyBGIGMMUOWOWQUOU[c@OSMSQUMSMWMWKYIWEQAGG[s@{Es@}ECWEYCWC[AWAY@[?[@YA[A[A[C]AOCQAMCOGUCMGMIOGICGIKMKKIMGMGMEQGGCAA??@@FBPFLDLFLFJHLJHJBFFHHNFLBLFTBN@LBP@NB\\@Z@Z@ZAX?ZAZ@X@VBZBVDXBVr@|Er@zEFZ@FDPHVJXLVLVLRPTLRNRZb@NTPTNVNVLTFLFHdAxB@BDDBDBDDKFKDEFIFGHIJGLEJCLCVEJALCVCXEPALAH?VAVCT?VAV@f@?J?H?F?L?B?XA`@CfFOd@ARAL?D?HA\\A\\Ah@ATAfEMD?LAEFCHAB?TDvC@R?PFnD@R?RFlD?R@RFlD?R@RDnD@P?PFzD@R?PFxD@R?PFnD?R@PFjD?V@NFdD@X@V?NFzC?V?RHlD?R?R@j@BhA@v@?@?P@R@bC@l@JJ@B@P@pAD|A?R?RB~@BhB?D@P?R?FDrB@r@?P@RFjD?V@PDfD?@@X?P@h@D~B@X?PFjD?B?R@R@`AADGV?b@@h@JN@D?NFnD@T?RBtABvA@P?R@f@ADGN?hA@f@JN@B@P?FDzB@j@?R@?PAD?\\A\\A';

describe('route geometry', () => {
  it('decodes the canonical Google polyline fixture', () => {
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toEqual([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ]);
  });

  it('rejects a truncated encoded value', () => {
    expect(() => decodePolyline('_')).toThrow('Invalid encoded polyline');
  });

  it('fits every route point inside the requested padding', () => {
    const points = decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
    const width = 320;
    const height = 280;
    const padding = 40;
    const viewport = fitRouteViewport({ height, padding, points, width });

    for (const { x, y } of projectRouteToPixels({ ...viewport, height, points, width })) {
      expect(x).toBeGreaterThanOrEqual(padding - 0.001);
      expect(x).toBeLessThanOrEqual(width - padding + 0.001);
      expect(y).toBeGreaterThanOrEqual(padding - 0.001);
      expect(y).toBeLessThanOrEqual(height - padding + 0.001);
    }
  });

  it('centers a single-point route and renders it as a one-command path', () => {
    const points = decodePolyline('_p~iF~ps|U');
    const pixels = projectRouteToPixels({
      center: points[0] as [number, number],
      height: 200,
      points,
      width: 300,
      zoom: 15,
    });

    expect(pixels).toEqual([{ x: 150, y: 100 }]);
    expect(toSvgPath(pixels)).toBe('M150.00 100.00');
  });

  it.each([
    { height: 360, name: 'desktop 16:9 card', width: 640 },
    { height: 255, name: 'desktop greenhouse cell', width: 460 },
    { height: 255, name: 'tablet greenhouse cell', width: 300 },
    { height: 300, name: 'mobile 4:3 card', width: 400 },
    { height: 220, name: 'mobile full-width card', width: 390 },
  ])('keeps the OSRM park loop inside $name with card padding', ({ height, width }) => {
    const points = decodePolyline(OSRM_GGP);
    const padding = CARD_ROUTE_PADDING;
    const viewport = fitRouteViewport({ height, padding, points, width });

    for (const { x, y } of projectRouteToPixels({ ...viewport, height, points, width })) {
      expect(x).toBeGreaterThanOrEqual(padding - 0.001);
      expect(x).toBeLessThanOrEqual(width - padding + 0.001);
      expect(y).toBeGreaterThanOrEqual(padding - 0.001);
      expect(y).toBeLessThanOrEqual(height - padding + 0.001);
    }
  });

  it('keeps the OSRM park loop uniformly tall in 16:9 and 4:3 cards', () => {
    const points = decodePolyline(OSRM_GGP);
    const boxes = [
      { height: 360, width: 640 },
      { height: 300, width: 400 },
    ] as const;

    const aspects = boxes.map(({ height, width }) => {
      const viewport = fitRouteViewport({
        height,
        padding: CARD_ROUTE_PADDING,
        points,
        width,
      });
      const pixels = projectRouteToPixels({ ...viewport, height, points, width });
      const xs = pixels.map(({ x }) => x);
      const ys = pixels.map(({ y }) => y);
      const spanX = Math.max(...xs) - Math.min(...xs);
      const spanY = Math.max(...ys) - Math.min(...ys);
      expect(spanY).toBeGreaterThan(height * 0.28);
      return spanX / spanY;
    });

    expect(Math.abs(aspects[0]! - aspects[1]!) / aspects[0]!).toBeLessThan(0.12);
  });

  it('uses a close zoom for a single-point route', () => {
    expect(
      fitRouteViewport({
        height: 300,
        padding: 40,
        points: [[47.6062, -122.3321]],
        width: 300,
      }),
    ).toEqual({ center: [47.6062, -122.3321], zoom: 15 });
  });
});
