import React from "react"
import { publicAPI } from "@/services/api"
import { Cloud, CloudRain, Sun, CloudSun, CloudDrizzle, CloudSnow, CloudLightning, Wind } from "lucide-react"

function selectWeatherIcon(description, iconCode) {
    const desc = (description || "").toLowerCase()
    if (desc.includes("thunder")) return { Icon: CloudLightning, className: "text-blue-800" }
    if (desc.includes("heavy") && desc.includes("rain")) return { Icon: CloudRain, className: "text-blue-900" }
    if (desc.includes("rain")) return { Icon: CloudRain, className: "text-blue-800" }
    if (desc.includes("drizzle")) return { Icon: CloudDrizzle, className: "text-blue-700" }
    if (desc.includes("snow")) return { Icon: CloudSnow, className: "text-blue-700" }
    if (desc.includes("clear")) return { Icon: Sun, className: "text-amber-500" }
    if (desc.includes("few") || desc.includes("scattered") || desc.includes("broken")) return { Icon: CloudSun, className: "text-blue-700" }
    if (desc.includes("wind") || desc.includes("breeze")) return { Icon: Wind, className: "text-blue-700" }
    // fallback based on icon code (e.g., 01d, 02n)
    if (iconCode && iconCode.startsWith("01")) return { Icon: Sun, className: "text-amber-500" }
    if (iconCode && (iconCode.startsWith("02") || iconCode.startsWith("03") || iconCode.startsWith("04"))) return { Icon: CloudSun, className: "text-blue-700" }
    if (iconCode && (iconCode.startsWith("09") || iconCode.startsWith("10"))) return { Icon: CloudRain, className: "text-blue-800" }
    if (iconCode && iconCode.startsWith("11")) return { Icon: CloudLightning, className: "text-blue-900" }
    if (iconCode && iconCode.startsWith("13")) return { Icon: CloudSnow, className: "text-blue-700" }
    return { Icon: Cloud, className: "text-blue-800" }
}

export default function WeatherCard() {
    const [data, setData] = React.useState(null)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        let isMounted = true
        publicAPI.weather()
            .then(res => { if (isMounted) setData(res.data) })
            .catch(err => { if (isMounted) setError("Unable to load weather") })
        return () => { isMounted = false }
    }, [])

    return (
        <div className="mt-5 mx-1 rounded-2xl p-6 border border-blue-300 bg-blue-100 text-blue-900 dark:bg-[#0a162b] dark:border-blue-900/50 dark:text-blue-100">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xs uppercase tracking-wide text-blue-800/90 dark:text-blue-300/90">Sri Lanka Weather</div>
                    <div className="text-sm text-blue-900 dark:text-blue-100/90">{data?.location || "Colombo, Sri Lanka"}</div>
                </div>
                {(() => {
                    const { Icon, className } = selectWeatherIcon(data?.description, data?.icon)
                    return <Icon className={`w-8 h-8 ${className}`} aria-label={data?.description || "weather icon"} />
                })()}
            </div>
            <div className="mt-3 flex items-end gap-3">
                <div className="text-4xl font-semibold leading-none">{data ? Math.round(data.temperatureCelsius) : "--"}°C</div>
                <div className="text-sm text-blue-800/90 dark:text-blue-200/80">{data?.description ? (data.description.charAt(0).toUpperCase() + data.description.slice(1)) : "Loading..."}</div>
            </div>
            <div className="mt-3 text-xs text-blue-800/90 dark:text-blue-200/80 flex gap-6">
                <div>Humidity: {data ? `${data.humidity}%` : "--"}</div>
                <div>Wind: {data ? `${Math.round(data.windSpeedMetersPerSecond)} m/s` : "--"}</div>
            </div>
            {error && <div className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</div>}
        </div>
    )
}


