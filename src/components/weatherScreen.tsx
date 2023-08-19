import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { location } from "../types/location"
import { WeatherForecast, WeatherDetails } from "../types/weather"

type weatherScreenProps = {
  location: location | undefined
}
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Nov",
  "Dec",
]

function weatherScreen({ location }: weatherScreenProps) {
  const [weather, setWeather] = useState<WeatherForecast[]>()
  const currentWeather = weather?.[0].data.instant.details
  useEffect(() => {
    async function fetchData() {
      if (!location) return
      try {
        const response = await axios.get(
          `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${location.lat}&lon=${location.lon}`
        )
        setWeather(response.data.properties.timeseries)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [location])
  const currentDate = new Date()
  const dayOfWeek = currentDate.getDay()
  const month = currentDate.getMonth()

  const next5hours = weather?.slice(2, 7).map((element, i) => {
    return (
      <div className="flex flex-col justify-center items-center py-2">
        {i == 0 ? (
          <p> now</p>
        ) : (
          <p>{element.time.match(/T(\d{2})/)?.slice(1)}</p>
        )}
        <p>{element.data.instant.details.air_temperature}°</p>
      </div>
    )
  })
  const weekWeather: (JSX.Element | undefined)[] | undefined = useMemo(() => {
    let recordingOfTheDay: WeatherForecast[] = []
    let daysCount = 0
    const today = new Date()
    return weather?.map((element, i) => {
      const date = new Date(element.time)
      const dayOfWeek = date.getUTCDay()
      if (today.getUTCDay() === dayOfWeek) return
      const hours = date.getUTCHours()
      if (!(hours === 0 || hours === 6 || hours === 12 || hours === 18)) return
      recordingOfTheDay.push(element)
      if (recordingOfTheDay.length < 4) return
      if (daysCount > 5) return
      daysCount++

      const maxTemps = recordingOfTheDay.map((element) => {
        return element.data.next_6_hours.details.air_temperature_max
      })
      const minTemps = recordingOfTheDay.map((element) => {
        return element.data.next_6_hours.details.air_temperature_min
      })
      const maxTemp = Math.max(...maxTemps)
      const minTemp = Math.min(...minTemps)
      const conditions: string =
        recordingOfTheDay[1]?.data.next_12_hours.summary.symbol_code
      const imageSrc = require(`../../public/assets/png/${conditions}.png`)
        .default.src
      recordingOfTheDay = []
      return (
        <div className="flex justify-around items-center " key={i}>
          <p className="">{daysOfWeek[dayOfWeek]}</p>
          <img src={imageSrc} alt={conditions} className="h-5" />
          <div className="flex  items-center gap-3">
            <p>{maxTemp}</p>
            <p>{minTemp}</p>
          </div>
        </div>
      )
    })
  }, [weather])

  return (
    <div className="w-full h-full flex flex-col gap-1 p-1 ">
      <div className=" flex justify-center text-xl items-center">
        {daysOfWeek[dayOfWeek]},{months[month]} {dayOfWeek}
      </div>
      <div className=" flex-grow flex flex-col justify-evenly border-l-black">
        {location?.city}
        <h2 className=" text-6xl">{currentWeather?.air_temperature}°</h2>
        {weather && (
          <>
            <div className="flex flex-row gap-3">
              <p>
                max: {weather[0].data.next_6_hours.details.air_temperature_max}
              </p>
              <p>
                min: {weather[0].data.next_6_hours.details.air_temperature_min}
              </p>
            </div>
            <p>
              {weather[0].data.next_6_hours.summary.symbol_code.replace(
                "_",
                " "
              )}
            </p>
          </>
        )}
      </div>
      <div className="flex justify-evenly items-center">{next5hours}</div>
      <div className="flex-grow">{weekWeather}</div>
    </div>
  )
}

export default weatherScreen
