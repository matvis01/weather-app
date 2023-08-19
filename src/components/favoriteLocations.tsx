import { useState, useEffect } from "react"
import { location } from "../types/location"

type favoriteLocationsProps = {
  currentLocation: location | undefined
}

function favoriteLocations({ currentLocation }: favoriteLocationsProps) {
  const [locations, setLocations] = useState<(location | undefined)[]>([])

  return (
    <div className="flex flex-col p-2">
      <button
        className="btn btn-primary"
        disabled={!currentLocation}
        onClick={() => {
          console.log(currentLocation)
          if (currentLocation && !locations.includes(currentLocation)) {
            setLocations((prev) => [currentLocation, ...prev])
          }
        }}
      >
        Add to favorites
      </button>
      <div className="flex gap-2 flex-wrap w-full justify-around">
        {locations.map((location, i) => {
          return (
            <div
              className="btn card bg-base-100 shadow-xl w-1/3 aspect-square"
              key={i}
            >
              <p>{location?.city}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default favoriteLocations
