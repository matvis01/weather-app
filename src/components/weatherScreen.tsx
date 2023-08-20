import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { location } from "../types/location"
import { WeatherForecast, SunData } from "../types/weather"
import { join } from "path"

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

function WeatherScreen({ location }: weatherScreenProps) {
  const [weather, setWeather] = useState<WeatherForecast[]>()
  const [sunInfo, setSunInfo] = useState<SunData>()
  const currentWeather = weather?.[0].data.instant.details
  async function fetchData() {
    if (!location) return
    try {
      const response = await axios.get(
        `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${location.lat}&lon=${location.lon}`
      )
      setWeather(response.data.properties.timeseries)
      const sunDataResponse = await axios.get(
        `https://api.met.no/weatherapi/sunrise/3.0/sun?lat=${location.lat}&lon=${location.lon}`
      )
      setSunInfo(sunDataResponse.data)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    fetchData()
  }, [location])

  useEffect(() => {
    setInterval(() => {
      fetchData()
    }, 1000 * 60 * 10)
  }, [])

  const currentDate = new Date()
  const dayOfWeek = currentDate.getDay()
  const month = currentDate.getMonth()
  const dayOfMonth = currentDate.getDate()

  const next5hours = weather?.slice(0, 7).map((element, i) => {
    if (i > 0 && i <= 2) return
    return (
      <div className=" flex flex-col justify-center items-center py-2" key={i}>
        {i == 0 ? (
          <p> now</p>
        ) : (
          <p>{element.time.match(/T(\d{2})/)?.slice(1)}:00</p>
        )}
        <p className="font-bold">
          {element.data.instant.details.air_temperature}°
        </p>
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
        recordingOfTheDay[2]?.data.next_12_hours.summary.symbol_code
      const imageSrc = require(`../../public/assets/png/${conditions}.png`)
        .default.src
      const precipitation =
        recordingOfTheDay[2]?.data.next_6_hours.details.precipitation_amount
      recordingOfTheDay = []
      return (
        <div
          className="grid grid-cols-3 justify-around items-center px-2  pl-8 "
          key={i}
        >
          <p className="">{daysOfWeek[dayOfWeek]}</p>
          <div className=" flex gap-2">
            <img src={imageSrc} alt={conditions} className="h-5" />
            <p className="justify-self-start">
              {precipitation === 0 || `${precipitation}%`}
            </p>
          </div>
          <div className="grid grid-cols-2">
            <p>↑ {maxTemp}</p>
            <p>↓ {minTemp}</p>
          </div>
        </div>
      )
    })
  }, [weather])

  const additionalInfo = (): JSX.Element => {
    const sunrise = sunInfo?.properties.sunrise.time
    let sunriseTime = ""
    if (sunrise) {
      const date = new Date(sunrise)
      const hours = date.getUTCHours()
      const minutes = date.getUTCMinutes()
      sunriseTime = `${hours}:${minutes}`
    }

    const sunset = sunInfo?.properties.sunset.time
    let sunsetTime = ""
    if (sunset) {
      const date = new Date(sunset)
      const hours = date.getUTCHours()
      const minutes = date.getUTCMinutes()
      sunsetTime = `${hours}:${minutes}`
    }

    return (
      <div className="grid grid-cols-3 pl-8">
        <div className="flex flex-col">
          <p>Sunrise</p>
          <p className="font-bold">{sunriseTime}</p>
        </div>
        <div className="flex flex-col">
          <p>Sunset</p>
          <p className="font-bold">{sunsetTime}</p>
        </div>
        <div className="flex flex-col">
          <p>Precipitation</p>
          <p className="font-bold">
            {weather &&
              weather[0].data.next_6_hours.details.precipitation_amount}
            %
          </p>
        </div>
        <div className="flex flex-col">
          <p>Humidity</p>
          <p className="font-bold">{currentWeather?.relative_humidity}%</p>
        </div>
        <div className="flex flex-col">
          <p>Wind</p>
          <p className="font-bold">{currentWeather?.wind_speed}km/h</p>
        </div>
        <div className="flex flex-col">
          <p>Pressure</p>
          <p className="font-bold">{currentWeather?.air_temperature}hPa</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card border border-primary  w-full h-full flex flex-col p-4 ">
      <div className=" flex justify-center text-xl">
        {daysOfWeek[dayOfWeek]},{months[month]} {dayOfMonth}
      </div>

      <div className=" flex-grow flex flex-col justify-evenly pl-6 lg:pl-20">
        {location?.city}
        <h2 className=" text-8xl">{currentWeather?.air_temperature}°</h2>
        {weather && (
          <>
            <div className="flex flex-row gap-3">
              <p>
                ↑ {weather[0].data.next_6_hours.details.air_temperature_max}
              </p>
              <p>
                ↓ {weather[0].data.next_6_hours.details.air_temperature_min}
              </p>
            </div>
            <p>
              {weather[0].data.next_6_hours.summary.symbol_code.replace(
                "_",
                " "
              )}
            </p>
            <img
              className="absolute aspect-auto right-0 -z-10 h-1/4 md:h-1/3 md:right-2 lg:1/4 "
              src={
                require(`../../public/assets/png/${weather[0].data.next_6_hours.summary.symbol_code}.png`)
                  .default.src
              }
              alt={weather[0].data.next_6_hours.summary.symbol_code}
            />
          </>
        )}
      </div>
      <div className="divider"></div>
      <div className="flex justify-evenly items-center">{next5hours}</div>
      <div className="divider"></div>
      <div className="">{weekWeather}</div>
      <div className="divider"></div>
      <div className="">{additionalInfo()}</div>
    </div>
  )
}

export default WeatherScreen
