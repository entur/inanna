import React, { type ReactNode, type RefObject } from 'react';
import Map, { type MapRef, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { setWorkerUrl, type StyleSpecification, type MapLibreEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// maplibre-gl v6 can't locate its worker inside a bundler, so point it at the Vite-bundled worker.
setWorkerUrl(maplibreWorkerUrl);

interface MapContainerProps {
  children?: ReactNode;
  mapStyle: StyleSpecification;
  onLoad: (evt: MapLibreEvent) => void;
  mapRef: RefObject<MapRef | null>;
  onContextMenu?: (event: MapLayerMouseEvent) => void;
  onClick?: (event: MapLayerMouseEvent) => void;
  onMouseMove?: (event: MapLayerMouseEvent) => void;
  interactiveLayerIds?: string[];
  cursor?: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  children,
  mapStyle,
  onLoad,
  mapRef,
  onContextMenu,
  onClick,
  onMouseMove,
  interactiveLayerIds,
  cursor,
}) => {
  return (
    <Map
      ref={mapRef}
      onLoad={onLoad}
      onContextMenu={onContextMenu}
      onClick={onClick}
      onMouseMove={onMouseMove}
      cursor={cursor}
      interactiveLayerIds={interactiveLayerIds}
      initialViewState={{
        longitude: 10.75,
        latitude: 59.91,
        zoom: 12,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
      // @ts-expect-error The `contextAttributes` prop is valid but may not be in the current type definitions.
      contextAttributes={{
        preserveDrawingBuffer: true,
      }}
    >
      {children}
    </Map>
  );
};
