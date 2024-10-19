/**
 *
 * @description Get the current coordinates of the user current location
 */
export const getCoordinates = () => (
  new Promise<GeolocationCoordinates>(
    (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          coords;
          resolve(coords);
        },
        (err) => {
          reject(err);
        }
      );
    })
);
