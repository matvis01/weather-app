import React, { useState, useMemo, useEffect, useRef } from "react"
import axios from "axios"
import _debounce from "lodash/debounce"
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete"
import { location } from "../types/location"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_ANALYTICS_API_KEY

function loadScript(src: string, position: HTMLElement | null, id: string) {
  if (!position) {
    return
  }

  const script = document.createElement("script")
  script.setAttribute("async", "")
  script.setAttribute("id", id)
  script.src = src
  position.appendChild(script)
}

const autocompleteService = { current: null }

interface PlaceType {
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
    main_text_matched_substrings?: { offset: number; length: number }[]
  }
}

type locationProps = {
  setLocation: (place: location) => void // or use the actual type if available
  location?: location
}

const CitySearchBox = ({ setLocation, location }: locationProps) => {
  const [value, setValue] = useState<PlaceType | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState<readonly PlaceType[]>([])
  const loaded = useRef(false)
  const [focused, setFocused] = useState(false)

  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`,
        document.querySelector("head"),
        "google-maps"
      )
    }

    loaded.current = true
  }

  const fetch = useMemo(
    () =>
      _debounce(
        (
          request: { input: string },
          callback: (results?: readonly PlaceType[]) => void
        ) => {
          ;(autocompleteService.current as any).getPlacePredictions(
            request,
            callback
          )
        },
        400
      ),
    []
  )

  useEffect(() => {
    let active = true

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (
        window as any
      ).google.maps.places.AutocompleteService()
    }
    if (!autocompleteService.current) {
      return undefined
    }

    if (inputValue === "") {
      setOptions(value ? [value] : [])
      return undefined
    }

    fetch({ input: inputValue }, (results?: readonly PlaceType[]) => {
      if (active) {
        let newOptions: readonly PlaceType[] = []
        // if (value) {
        //   newOptions = [value]
        // }
        if (results) {
          newOptions = [...newOptions, ...results]
        }

        setOptions(newOptions)
      }
    })

    return () => {
      active = false
    }
  }, [value, inputValue, fetch])

  useEffect(() => {
    if (location && location.city) {
      setInputValue(location.city)
    }
  }, [location])

  useEffect(() => {
    async function getGeoCode() {
      if (!value) return
      const results = await getGeocode({ address: value.description })
      const position = await getLatLng(results[0])
      let fullLocation: location = {
        lat: null,
        lon: null,
        city: null,
        country: null,
        street: null,
        zipCode: null,
      }
      results[0].address_components.forEach((component) => {
        component.types.forEach((type) => {
          if (
            type === "locality" ||
            type === "sublocality" ||
            type === "neighborhood"
          ) {
            fullLocation.city = component.long_name
          }
          if (type === "country") {
            fullLocation.country = component.long_name
          }
          if (type === "postal_code") {
            fullLocation.zipCode = component.long_name
          }
          if (type == "route") {
            fullLocation.street = component.long_name
          }
        })
      })
      fullLocation.lat = position.lat
      fullLocation.lon = position.lng
      // fullLocation.name = value.description
      setLocation(fullLocation)
    }
    getGeoCode()
  }, [value])

  return (
    <form
      className="flex flex-col dropdown dropdown-bottom items-center justify-center w-full"
      onSubmit={(e) => {
        e.preventDefault()
        setFocused(false)
        setValue(options[0])
        setInputValue(options[0].structured_formatting.main_text)
        setOptions([])
      }}
    >
      <input
        type="text"
        className="input input-bordered border-primary w-full"
        placeholder="Search location"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        tabIndex={0}
      />
      {options.length > 0 && (
        <ul
          className="dropdown-content z-[1] bg-white menu p-2 shadow   "
          tabIndex={0}
        >
          {options.map((option, index) => {
            return (
              <li
                key={index}
                className=""
                onClick={() => {
                  setOptions([])
                  setValue(option)
                  setInputValue(option.structured_formatting.main_text)
                  setFocused(false)
                }}
              >
                <div className="hover:bg-primary">
                  <div>
                    {option.structured_formatting.main_text}
                    <p className="text-sm text-gray-500">
                      {option.structured_formatting.secondary_text}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </form>
  )
}

export default CitySearchBox
