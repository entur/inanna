import type { StopPlaceContext } from './stopPlaceTypes.ts';

let fetchedStopPlaces: StopPlaceContext | undefined = undefined;

export const fetchStopPlaces = async (): Promise<StopPlaceContext> => {
  const response = await fetch(`${import.meta.env.BASE_URL}stopPlaces.json`);
  fetchedStopPlaces = await response.json();

  return Object.assign({}, fetchedStopPlaces);
};
