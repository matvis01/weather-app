import Image from "next/image"
import { Inter } from "next/font/google"
import NavBar from "../components/navBar"
import { useEffect, useState } from "react"
import { themeChange } from "theme-change"
import CitySearchBox from "../components/citySearchBox"
import MainTemp from "../components/weatherScreen"
import { location } from "../types/location"
import FavoriteLocations from "../components/favoriteLocations"

const inter = Inter({ subsets: ["latin"] })

const themeSelect = (
  <select
    className="select gradientselect select-bordered m-2"
    data-choose-theme
  >
    <option disabled value="cupcake">
      Pick a theme
    </option>
    <option value="">Default</option>
    <option value="light">Light</option>
    <option value="retro">Retro</option>
    <option value="cupcake">Cupcake</option>
    <option value="cyberpunk">Cyberpunk</option>
  </select>
)

export default function Home() {
  const [location, setLocation] = useState<location>()

  useEffect(() => {
    themeChange(false)
  }, [])

  return (
    <div className=" min-h-screen w-screen gap-2 p-8 flex flex-col mainGrid">
      {/* <div className="row-span-3 border-2">
        <NavBar />
      </div> */}
      <div className="flex items-center justify-center gap-2 px-2">
        <CitySearchBox setLocation={(place: location) => setLocation(place)} />
      </div>
      <div className=" row-span-1 col-span-1  flex justify-end">
        {themeSelect}
      </div>
      <div className="row-span-1 col-span-1 border-2">
        <MainTemp location={location} />
      </div>
      <div className="row-span-1 col-span-1  border-2 ">
        <FavoriteLocations currentLocation={location} />
      </div>
    </div>
  )
}
