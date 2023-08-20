export type WeatherDetails = {
  instant: {
    details: {
      air_pressure_at_sea_level: number
      air_temperature: number
      cloud_area_fraction: number
      cloud_area_fraction_high: number
      cloud_area_fraction_low: number
      cloud_area_fraction_medium: number
      dew_point_temperature: number
      fog_area_fraction: number
      relative_humidity: number
      ultraviolet_index_clear_sky: number
      wind_from_direction: number
      wind_speed: number
    }
  }
  next_12_hours: {
    summary: {
      symbol_code: string
    }
  }
  next_1_hours: {
    summary: {
      symbol_code: string
    }
    details: {
      precipitation_amount: number
    }
  }
  next_6_hours: {
    summary: {
      symbol_code: string
    }
    details: {
      air_temperature_max: number
      air_temperature_min: number
      precipitation_amount: number
    }
  }
}

export type WeatherForecast = {
  time: string
  data: WeatherDetails
}

export type SunData = {
  copyright: string
  licenseURL: string
  type: string
  geometry: {
    type: string
    coordinates: [number, number]
  }
  when: {
    interval: [string, string]
  }
  properties: {
    body: string
    sunrise: {
      time: string
      azimuth: number
    }
    sunset: {
      time: string
      azimuth: number
    }
    solarnoon: {
      time: string
      disc_centre_elevation: number
      visible: boolean
    }
    solarmidnight: {
      time: string
      disc_centre_elevation: number
      visible: boolean
    }
  }
}
