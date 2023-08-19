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
}

const Autocomplete = ({ setLocation }: locationProps) => {
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

        if (value) {
          newOptions = [value]
        }

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
      console.log(results[0])
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
    <div className="flex flex-col items-center justify-center w-full">
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="Search location"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onFocus={() => setFocused(true)}
      />
      {options.length > 0 && focused && (
        <ul className="mt-1 space-y-1 p-2 shadow-md bg-white z-10 absolute  top-32 md:top-16">
          {options.map((option, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-secondary relative z-10"
              onClick={() => {
                setOptions([])
                setValue(option)
                setInputValue(option.structured_formatting.main_text)
                setFocused(false)
              }}
            >
              <div className="flex items-center space-x-2">
                <div>
                  {option.structured_formatting.main_text}
                  <p className="text-sm text-gray-500">
                    {option.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Autocomplete
