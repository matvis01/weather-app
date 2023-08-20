import { useState, useEffect } from "react"
import { location } from "../types/location"
import axios from "axios"

type favoriteLocationsProps = {
  currentLocation: location | undefined
  changeLocation: (place: location) => void
}

type locationWithTemp = {
  location: location
  temp: number
}

function FavoriteLocations({
  currentLocation,
  changeLocation,
}: favoriteLocationsProps) {
  const [locations, setLocations] = useState<location[]>([])
  const [locationsWithTemp, setLocationsWithTemp] = useState<
    locationWithTemp[]
  >([])
  const [removing, setRemoving] = useState(false)

  async function fetchData() {
    try {
      const promises = locations.map(async (location) => {
        const response = await axios.get(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${location?.lat}&lon=${location?.lon}`
        )
        const temp = response.data.properties.timeseries[0].data.instant.details
        return {
          location: location,
          temp: temp.air_temperature,
        }
      })

      const locWithTemps = await Promise.all(promises)
      console.log(locWithTemps)
      setLocationsWithTemp([...locWithTemps])
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchData()
  }, [locations])
  useEffect(() => {
    setInterval(() => {
      fetchData()
    }, 1000 * 60 * 60)
  }, [])

  return (
    <div className="card border border-primary flex flex-col p-4 items-center gap-4 w-full h-full">
      <div className="flex  items-center gap-2">
        <button
          className="btn btn-primary w-fit"
          disabled={!currentLocation || locations.includes(currentLocation)}
          onClick={() => {
            if (currentLocation && !locations.includes(currentLocation)) {
              setLocations((prev) => [currentLocation, ...prev])
            }
          }}
        >
          Add to favorites
        </button>
        {removing ? (
          <button
            className="btn btn-primary"
            onClick={() => setRemoving(!removing)}
          >
            ✓
          </button>
        ) : (
          <button
            className="btn btn-secondary "
            onClick={() => setRemoving(!removing)}
            disabled={locations.length === 0}
          >
            x
          </button>
        )}
      </div>
      <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 align-top ">
        {locationsWithTemp?.map((location, i) => {
          return (
            <button
              key={i}
              onClick={() => {
                if (removing) {
                  setLocations((prev) =>
                    prev.filter((loc) => loc !== location.location)
                  )
                  locations.length === 1 && setRemoving(false)
                } else {
                  changeLocation(location.location)
                }
              }}
              className="card aspect-square border border-primary p-4 shadow-xl flex flex-around justify-evenly items-center hover:shadow-lg active:shadow-md"
            >
              {removing && (
                <div className="card absolute top-0 right-0 left-0 bottom-0 bg-gray-900/60 flex justify-center items-center ">
                  <p className="absolute text-7xl text-secondary">X</p>
                </div>
              )}
              <h2 className="text-4xl font-semibold">{location.temp}°C</h2>
              <div className="flex flex-col justify-center">
                <p className="font-semibold text-lg">
                  {location?.location.city}
                </p>
                <p className="">{location?.location.country}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FavoriteLocations
