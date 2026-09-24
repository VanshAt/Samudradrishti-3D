import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as Cesium from "cesium";

export interface OceanViewerRef {
  resetView: () => void;
}

const BAY_OF_BENGAL_DESTINATION = Cesium.Cartesian3.fromDegrees(
  89.0,
  15.0,
  1_600_000
);

const flyToBayOfBengal = (viewer: Cesium.Viewer): void => {
  viewer.camera.flyTo({
    destination: BAY_OF_BENGAL_DESTINATION,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-55),
      roll: 0,
    },
    duration: 1.5,
  });
};

const OceanViewer = forwardRef<OceanViewerRef, {}>((_props, ref) => {
  const cesiumContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useImperativeHandle(ref, () => ({
    resetView: (): void => {
      if (viewerRef.current) {
        flyToBayOfBengal(viewerRef.current);
      }
    },
  }));

  useEffect(() => {
    const container = cesiumContainerRef.current;

    if (!container || viewerRef.current) {
      return;
    }

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;

    if (token?.trim()) {
      Cesium.Ion.defaultAccessToken = token;
    } else {
      console.warn(
        "Missing VITE_CESIUM_ION_TOKEN. Add it to frontend/.env and restart Vite."
      );
    }

    // Modern pattern: Use addImageryProvider since imageryProvider option is deprecated in newer Cesium versions
    const viewer = new Cesium.Viewer(container, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      vrButton: false,
      baseLayer: false, // Ensure no default imagery layer is created
    });

    viewerRef.current = viewer;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString("#0A192F");

    const darkImageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      credit: new Cesium.Credit(
        "Map tiles by CARTO, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
      ),
    });
    viewer.imageryLayers.addImageryProvider(darkImageryProvider);

    flyToBayOfBengal(viewer);

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }

      viewerRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={cesiumContainerRef}
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none absolute left-5 top-5 z-10">
        <div className="rounded-xl border border-cyan-300/25 bg-[#061522]/80 px-4 py-3 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-bold tracking-wide text-[#E6FBFF]">
            3D Ocean Viewer
          </h2>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4D8]" />
            <p className="text-sm font-medium text-[#8EB7C2]">
              Bay of Bengal • Demo Mode
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

OceanViewer.displayName = "OceanViewer";

export default OceanViewer;
