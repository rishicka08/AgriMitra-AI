
import { useState } from 'react'
import './App.css'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [showCrops, setShowCrops] = useState(false)
  const [soilType, setSoilType] = useState('')
  const [season, setSeason] = useState('')
  const [waterAvailability, setWaterAvailability] = useState('')
  const [recommendedCrops, setRecommendedCrops] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mandiCrop, setMandiCrop] = useState('Tomato')
  const [mandiState, setMandiState] = useState('Karnataka')
  const [assistantLanguage, setAssistantLanguage] = useState('en')
  const [farmerQuestion, setFarmerQuestion] = useState('')
  const [assistantAnswer, setAssistantAnswer] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [assistantError, setAssistantError] = useState('')
  const [mandiPrices, setMandiPrices] = useState([])
  const [mandiLoading, setMandiLoading] = useState(false)
  const [mandiError, setMandiError] = useState('')

  const getWeather = () => {
    setLoading(true)
    setError('')
    setWeather(null)

    if (!navigator.geolocation) {
      setError('Your browser does not support location detection.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          const locationResponse = await fetch(
  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
)

const locationData = await locationResponse.json()

const detectedState = locationData.principalSubdivision

if (detectedState) {
  const stateName = detectedState.replace(' State', '')
  setMandiState(stateName)
}

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
          )

          if (!response.ok) {
            throw new Error('Weather service is unavailable.')
          }

          const data = await response.json()

          setWeather({
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            feelsLike: data.current.apparent_temperature,
            rain: data.current.precipitation,
            wind: data.current.wind_speed_10m,
            code: data.current.weather_code,
            latitude,
            longitude
          })
        } catch (err) {
          setError(err.message || 'Unable to load weather information.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setError('Location access denied. Please allow location permission in Chrome.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }


const getMandiPrices = async () => {
  setMandiLoading(true)
  setMandiError('')
  setMandiPrices([])

  try {
    const url = `/api/mandi?state=${encodeURIComponent(mandiState)}&commodity=${encodeURIComponent(mandiCrop)}`

    const response = await fetch(url)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Unable to get mandi prices.')
    }

    setMandiPrices(result.records || [])

    if (!result.records || result.records.length === 0) {
      setMandiError('No market prices are currently available for this combination. Please try another crop or state. Market prices depend on the latest arrivals.')
    }
  } catch (err) {
    setMandiError(err.message || 'Unable to load market prices.')
  } finally {
    setMandiLoading(false)
  }
}

const askAssistant = async () => {
  setAssistantLoading(true)
  setAssistantError('')
  setAssistantAnswer('')

  try {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: farmerQuestion,
        language: assistantLanguage
      })
    })
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Unable to generate an answer.')
    }

    setAssistantAnswer(result.answer)
  } catch (err) {
    setAssistantError(err.message || 'Unable to generate an answer.')
  } finally {
    setAssistantLoading(false)
  }
}

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear Sky ☀️'
    if ([1, 2, 3].includes(code)) return 'Partly Cloudy 🌤️'
    if ([45, 48].includes(code)) return 'Foggy 🌫️'
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle 🌦️'
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rainy 🌧️'
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snowy ❄️'
    if ([95, 96, 99].includes(code)) return 'Thunderstorm ⛈️'
    return 'Weather information available'
  }

const findSuitableCrops = () => {
  const crops = [
    {
    name: 'Rice',
    soils: ['Alluvial', 'Clay'],
    seasons: ['Kharif', 'Rabi'],
    water: ['High'],
    duration: '100–150 days',
    temperature: '20–35°C',
    waterRequirement: 'High — 1,200–1,500 mm'
  },
    {
    name: 'Millets',
    soils: ['Red', 'Sandy', 'Black'],
    seasons: ['Kharif', 'Zaid'],
    water: ['Low', 'Medium'],
    duration: '70–120 days',
    temperature: '25–35°C',
    waterRequirement: 'Low — 300–500 mm'
  },
     {
    name: 'Groundnut',
    soils: ['Red', 'Sandy'],
    seasons: ['Kharif', 'Rabi'],
    water: ['Low', 'Medium'],
    duration: '100–130 days',
    temperature: '20–30°C',
    waterRequirement: 'Medium — 500–700 mm'
  },
   {
    name: 'Cotton',
    soils: ['Black'],
    seasons: ['Kharif'],
    water: ['Medium', 'Low'],
    duration: '150–180 days',
    temperature: '21–30°C',
    waterRequirement: 'Medium — 500–800 mm'
  },
     {
    name: 'Maize',
    soils: ['Alluvial', 'Red', 'Black'],
    seasons: ['Kharif', 'Rabi'],
    water: ['Medium', 'High'],
    duration: '90–120 days',
    temperature: '18–32°C',
    waterRequirement: 'Medium — 500–800 mm'
  },
    {
    name: 'Chickpea',
    soils: ['Black', 'Alluvial'],
    seasons: ['Rabi'],
    water: ['Low', 'Medium'],
    duration: '90–120 days',
    temperature: '15–25°C',
    waterRequirement: 'Low — 300–450 mm'
  },
    {
    name: 'Mustard',
    soils: ['Alluvial', 'Sandy'],
    seasons: ['Rabi'],
    water: ['Low', 'Medium'],
    duration: '100–140 days',
    temperature: '10–25°C',
    waterRequirement: 'Low — 300–400 mm'
  },
    {
    name: 'Sugarcane',
    soils: ['Alluvial', 'Black'],
    seasons: ['Kharif', 'Zaid'],
    water: ['High'],
    duration: '10–18 months',
    temperature: '20–35°C',
    waterRequirement: 'High — 1,500–2,500 mm'
  }
  ]

  const results = crops.filter((crop) =>
    crop.soils.includes(soilType) &&
    crop.seasons.includes(season) &&
    crop.water.includes(waterAvailability)
  )

  setRecommendedCrops(results)
}

  if (showCrops) {
  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>🌱 AgriMitra AI</h2>
        <button onClick={() => setShowCrops(false)}>
          Back to Dashboard
        </button>
      </nav>

      <main className="dashboard-content">
  <h1>🌾 Explore Crops</h1>
  <p>Discover crops suitable for your farming conditions.</p>

  <div className="dashboard-card">
    <h2>🌱 Select Your Soil Type</h2>

    <select
      value={soilType}
      onChange={(e) => setSoilType(e.target.value)}
    >
      <option value="">Choose your soil type</option>
      <option value="Alluvial">Alluvial Soil</option>
      <option value="Black">Black Soil</option>
      <option value="Red">Red Soil</option>
      <option value="Laterite">Laterite Soil</option>
      <option value="Sandy">Sandy Soil</option>
      <option value="Clay">Clay Soil</option>
    </select>
  </div>
  <div className="dashboard-card">
  <h2>🌤️ Select Growing Season</h2>

  <select
    value={season}
    onChange={(e) => setSeason(e.target.value)}
  >
    <option value="">Choose growing season</option>
    <option value="Kharif">Kharif (Monsoon)</option>
    <option value="Rabi">Rabi (Winter)</option>
    <option value="Zaid">Zaid (Summer)</option>
  </select>
</div>
<div className="dashboard-card">
  <h2>💧 Water Availability</h2>

  <select
    value={waterAvailability}
    onChange={(e) => setWaterAvailability(e.target.value)}
  >
    <option value="">Choose water availability</option>
    <option value="High">High (Plenty of water)</option>
    <option value="Medium">Medium (Limited irrigation)</option>
    <option value="Low">Low (Rain-dependent)</option>
  </select>
</div>
<button
  onClick={() => {
  if (!soilType || !season || !waterAvailability) {
    alert('Please select all three farming conditions.')
    return
  }

  findSuitableCrops()
}}
>
  🌾 Find Suitable Crops
</button>

{recommendedCrops.length > 0 && (
  <div className="dashboard-card">
    <h2>🌾 Recommended Crops for You</h2>
    <p>Based on your selected farming conditions.</p>

    <div className="dashboard-grid">
      {recommendedCrops.map((crop, index) => (
        <div className="dashboard-card" key={index}>
  <h3>🌱 {crop.name}</h3>
  <p>⏳ Growing Duration: {crop.duration}</p>
  <p>🌡️ Ideal Temperature: {crop.temperature}</p>
  <p>💧 Water Requirement: {crop.waterRequirement}</p>
  <p>Suitable for your selected soil, season and water availability.</p>
</div>
      ))}
    </div>
  </div>
)}

{recommendedCrops.length === 0 &&
  soilType && season && waterAvailability && (
    <p>No matching crops found. Try different farming conditions.</p>
)}

</main>
    </div>
  )
}
  if (showDashboard) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h2>🌱 AgriMitra AI</h2>
          <button onClick={() => setShowDashboard(false)}>
            Home
          </button>
        </nav>

        <main className="dashboard-content">
          <h1>Welcome, Farmer! 👋</h1>
          <p>Your smart farming companion is ready to help.</p>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h2>🌦️ Weather Advisory</h2>
              <h3>Local Weather Updates</h3>
              <p>Check the weather conditions at your current location.</p>

              <button onClick={getWeather} disabled={loading}>
                {loading ? 'Getting Weather...' : 'Check My Weather'}
              </button>

              {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}

              {weather && (
                <div style={{ marginTop: '25px', lineHeight: '2' }}>
                  <h2>{getWeatherDescription(weather.code)}</h2>
                  <h1 style={{ color: '#247a3c', fontSize: '42px' }}>
                    {weather.temperature}°C
                  </h1>
                  <p>Feels like: {weather.feelsLike}°C</p>
                  <p>💧 Humidity: {weather.humidity}%</p>
                  <p>🌧️ Precipitation: {weather.rain} mm</p>
                  <p>💨 Wind speed: {weather.wind} km/h</p>
                  <p>📍 Latitude: {weather.latitude.toFixed(4)}</p>
                  <p>📍 Longitude: {weather.longitude.toFixed(4)}</p>
                  <p style={{ fontSize: '12px', color: '#68766a' }}>
                    Weather data provided by Open-Meteo.
                  </p>
                </div>
              )}
            </div>

            
<div className="dashboard-card">
  <h2>💰 Mandi Prices</h2>
  <h3>Check Agricultural Market Rates</h3>

 
<label>Choose a Crop</label>

<input
  type="text"
  list="crop-options"
  placeholder="Search or select a crop..."
  value={mandiCrop}
  onChange={(e) => setMandiCrop(e.target.value)}
/>

<datalist id="crop-options">
  <option value="Tomato" />
  <option value="Brinjal" />
  <option value="Onion" />
  <option value="Potato" />
  <option value="Rice" />
  <option value="Wheat" />
  <option value="Cabbage" />
  <option value="Cauliflower" />
  <option value="Carrot" />
  <option value="Green Chilli" />
  <option value="Okra" />
  <option value="Cucumber" />
  <option value="Banana" />
  <option value="Mango" />
  <option value="Apple" />
  <option value="Grapes" />
  <option value="Groundnut" />
  <option value="Cotton" />
  <option value="Maize" />
  <option value="Sugarcane" />
</datalist>


 
<label>Choose a State</label>

<select
  value={mandiState}
  onChange={(e) => setMandiState(e.target.value)}
>
  <option value="Andhra Pradesh">Andhra Pradesh</option>
  <option value="Assam">Assam</option>
  <option value="Bihar">Bihar</option>
  <option value="Chhattisgarh">Chhattisgarh</option>
  <option value="Goa">Goa</option>
  <option value="Gujarat">Gujarat</option>
  <option value="Haryana">Haryana</option>
  <option value="Jharkhand">Jharkhand</option>
  <option value="Karnataka">Karnataka</option>
  <option value="Kerala">Kerala</option>
  <option value="Keralam">Keralam</option>
  <option value="Madhya Pradesh">Madhya Pradesh</option>
  <option value="Maharashtra">Maharashtra</option>
  <option value="Odisha">Odisha</option>
  <option value="Punjab">Punjab</option>
  <option value="Rajasthan">Rajasthan</option>
  <option value="Tamil Nadu">Tamil Nadu</option>
  <option value="Telangana">Telangana</option>
  <option value="Uttar Pradesh">Uttar Pradesh</option>
  <option value="Uttarakhand">Uttarakhand</option>
  <option value="West Bengal">West Bengal</option>
</select>


  <button onClick={getMandiPrices} disabled={mandiLoading}>
    {mandiLoading ? 'Loading Prices...' : 'Find Mandi Prices'}
  </button>

  {mandiError && <p style={{ color: 'red' }}>{mandiError}</p>}

  {mandiPrices.map((item, index) => (
    <div key={index} style={{
      marginTop: '20px',
      padding: '15px',
      background: '#f3f8f1',
      borderRadius: '10px'
    }}>
      <h3>{item.market}</h3>
      <p>District: {item.district}</p>
      <p>Commodity: {item.commodity}</p>
      <p>Minimum: ₹{item.min_price} / quintal</p>
      <p>Maximum: ₹{item.max_price} / quintal</p>
      <p>Modal Price: ₹{item.modal_price} / quintal</p>
      <p>📅 Latest Market Update: {item.arrival_date}</p>
    </div>
  ))}
</div>


           
<div className="dashboard-card">
  <h2>🌾 Explore Crops</h2>
  <h3>Discover the Right Crop</h3>
  <p>Find crops suitable for your farming conditions.</p>

  <button onClick={() => setShowCrops(true)}>
    Explore Crops
  </button>
</div>


            
<div className="dashboard-card">
  <h2>🤖 Multilingual AI Assistant</h2>
  <h3>Ask AgriMitra</h3>
  <p>Ask your farming questions in your own language.</p>

  <label>Choose your language</label>
  <select
  value={assistantLanguage}
  onChange={(e) => setAssistantLanguage(e.target.value)}
>
    <option value="en">English</option>
    <option value="ta">தமிழ் (Tamil)</option>
    <option value="hi">हिन्दी (Hindi)</option>
    <option value="te">తెలుగు (Telugu)</option>
    <option value="kn">ಕನ್ನಡ (Kannada)</option>
    <option value="ml">മലയാളം (Malayalam)</option>
    <option value="bn">বাংলা (Bengali)</option>
    <option value="mr">मराठी (Marathi)</option>
    <option value="gu">ગુજરાતી (Gujarati)</option>
    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
    <option value="or">ଓଡ଼ିଆ (Odia)</option>
    <option value="ur">اردو (Urdu)</option>
  </select>

  <label>Type your farming question</label>
  <textarea
  placeholder="Example: Which crop is suitable for my soil?"
  rows="4"
  value={farmerQuestion}
  onChange={(e) => setFarmerQuestion(e.target.value)}
/>

  <button onClick={askAssistant} disabled={assistantLoading}>
    {assistantLoading ? 'Getting Answer...' : 'Send Question'}
  </button>

  {assistantError && <p style={{ color: 'red', marginTop: '20px' }}>{assistantError}</p>}
  {assistantAnswer && (
    <div style={{
      marginTop: '20px',
      padding: '15px',
      background: '#f3f8f1',
      borderRadius: '10px',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6'
    }}>
      {assistantAnswer}
    </div>
  )}
</div>

          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <h2>🌱 AgriMitra AI</h2>
        <div>
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <h1>Your Smart Farming Companion</h1>
        <p>
          Empowering farmers with AI-powered advice,
          weather updates and market information.
        </p>
        <button onClick={() => setShowDashboard(true)}>
          Get Started
        </button>
      </section>

      <section className="features" id="features">
        <h2>What AgriMitra Offers</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>🌦️ Weather Updates</h3>
            <p>Stay informed about weather conditions.</p>
          </div>
          <div className="feature">
            <h3>🌾 Crop Suggestions</h3>
            <p>Discover suitable crops for your soil.</p>
          </div>
          <div className="feature">
            <h3>💰 Mandi Prices</h3>
            <p>Check market prices for your crops.</p>
          </div>
          <div className="feature">
            <h3>🤖 AI Assistant</h3>
            <p>Get farming guidance in your language.</p>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <h2>About AgriMitra AI</h2>
        <p>
          AgriMitra AI is a smart agricultural assistant
          designed to help farmers make better farming
          decisions using technology and artificial intelligence.
        </p>
      </section>

      <footer>
        <p>© 2026 AgriMitra AI. Smart Farming, Better Future.</p>
      </footer>
    </div>
  )
}

export default App
