import { Inter } from "next/font/google"
import { useEffect, useState } from "react"
import { themeChange } from "theme-change"
import CitySearchBox from "../components/citySearchBox"
import MainTemp from "../components/weatherScreen"
import { location } from "../types/location"
import FavoriteLocations from "../components/favoriteLocations"

const inter = Inter({ subsets: ["latin"] })

const themeSelect = (
  <select className="select select-primary   m-2" data-choose-theme>
    <option disabled value="cupcake">
      Pick a theme
    </option>
    <option value="">Dark</option>
    <option value="light">Light</option>
    <option value="retro">Retro</option>
    <option value="cupcake">Cupcake</option>
    {/* <option value="cyberpunk">Cyberpunk</option> */}
  </select>
)

export default function Home() {
  const [location, setLocation] = useState<location>()

  useEffect(() => {
    themeChange(false)
  }, [])

  return (
    <div className=" min-h-screen w-full gap-4 p-8 flex flex-col mainGrid">
      <div className="flex items-center justify-center gap-2 ">
        <CitySearchBox setLocation={(place: location) => setLocation(place)} />
      </div>
      <div className=" row-span-1 col-span-1  flex justify-end order-first md:order-none">
        {themeSelect}
      </div>
      <div className="row-span-1 col-span-1 shadow-xl">
        {location ? (
          <MainTemp location={location} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <h1 className="text-2xl">Search for a location ↑</h1>
          </div>
        )}
      </div>
      <div className="row-span-1 col-span-1 shadow-xl ">
        <FavoriteLocations
          currentLocation={location}
          changeLocation={(place: location) => setLocation(place)}
        />
      </div>
    </div>
  )
}
