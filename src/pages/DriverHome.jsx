import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import GoogleMapComponent from "../components/GoogleMap";
import SearchBar from "../components/SearchBar";
import TripsList from "../components/TripsList";

// Dummy function to simulate backend call
const sendLocationToBackend = async (location, userId) => {
  try {
    // Replace with your backend API call to send location data
    const response = await fetch("/api/send-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        from: { lat: location.lat, lng: location.lng },
        to: { lat: 12.9716, lng: 77.5946 }, // You can replace this with destination location
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send location data");
    }

    const data = await response.json();
    return data; // Dummy data response
  } catch (error) {
    console.error("Error sending location:", error);
    return { price: 50 }; // Dummy response
  }
};

const DriverHome = () => {
  const [markerPosition, setMarkerPosition] = useState({ lat: 0, lng: 0 });
  const [homeLocation, setHomeLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [showHomeSearch, setShowHomeSearch] = useState(true);
  const [isHomeSet, setIsHomeSet] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Fetching location...");
  const [price, setPrice] = useState(null);
  const [isPriceFetched, setIsPriceFetched] = useState(false); // New state for showing the "CONFIRM" button
  const [showPassengerDetails, setShowPassengerDetails] = useState(false); // New state to show passenger details

  const [progressWidth, setProgressWidth] = useState(24); // Starting progress for the progress bar

  // Fetch current location from backend when component mounts
  useEffect(() => {
    const getCurrentLocation = async () => {
      // Replace this with a real API call to get the current location
      const location = { lat: 12.9716, lng: 77.5946 }; // Dummy location for now
      setCurrentLocation(`Latitude: ${location.lat}, Longitude: ${location.lng}`);
      setMarkerPosition(location); // Set the marker to the fetched location
    };

    getCurrentLocation();
  }, []);

  const handleSetHomeLocation = (location) => {
    setHomeLocation(location);
    setIsHomeSet(true);
  };

  const handleResetHome = () => {
    setHomeLocation(null);
    setIsHomeSet(false);
  };

  const handleOkayClick = async () => {
    const userId = "dummyUserId"; // Replace this with actual userId from your authentication system
    const location = markerPosition;

    // Call the dummy backend function to send the location and fetch price
    const response = await sendLocationToBackend(location, userId);
    setPrice(response.price); // Assuming the backend returns { price: 50 }
    setIsPriceFetched(true); // Set state to hide OKAY and show CONFIRM button
  };

  const handleConfirmClick = () => {
    // Show passenger details and hide the right side with search bars and price
    setShowPassengerDetails(true);
    setShowHomeSearch(false); // Hide the search bar section and price
  };


  const handleCancelRide = () => {
    const isConfirmed = window.confirm("Are you sure you want to cancel the ride?");
    if (isConfirmed) {
      const decreaseProgress = (currentWidth) => {

        const nearestMultipleOf10 = Math.floor(currentWidth / 10) * 10;

        if (currentWidth > nearestMultipleOf10) {
          setProgressWidth(currentWidth - 1);
        }

        if (currentWidth > nearestMultipleOf10 + 1) {
          setTimeout(() => {
            decreaseProgress(currentWidth - 1);
          }, 100);
        } else {

          setTimeout(() => {
            setShowPassengerDetails(false);
            setShowHomeSearch(true);
            setPrice(null);
            setIsPriceFetched(false);
          }, 2000);
        }
      };

      decreaseProgress(progressWidth);
    }
  };

  return (
    <div className="min-h-screen bg-black-100 flex flex-col overflow-hidden">
      <Navbar
        setShowHomeSearch={() => setShowHomeSearch(true)}
        resetHome={handleResetHome}
        isHomeSet={isHomeSet}
      />

      <div className="flex w-full flex-1 overflow-hidden">
        <div className="w-1/2 h-full p-4">
          <GoogleMapComponent
            markerPosition={markerPosition}
            homeLocation={homeLocation}
            passengerLocation={passengerLocation}
            route={route}
          />
        </div>

        {/* Right Section with Search Bar and Price */}
        <div className="w-1/2 h-full p-4 ml-20 flex flex-col">
          {showHomeSearch && (
            <>
              {/* Current Location Placeholder */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 ml-10">Current Location</label>
                <input
                  type="text"
                  className="w-3/4 p-3 rounded-lg border shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ease-in-out duration-200 text-lg font-medium ml-10"
                  placeholder={currentLocation}
                  disabled
                />
              </div>

              {/* Destination Search Bar with Label */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 ml-10">Destination</label>
                <SearchBar
                  setHomeLocation={handleSetHomeLocation}
                  setShowHomeSearch={setShowHomeSearch}
                />
              </div>

              {/* OKAY Button */}
              {!isPriceFetched && (
                <div className="mb-4">
                  <button
                    onClick={handleOkayClick}
                    className="w-3/4 p-3 rounded-lg bg-indigo-500 text-white font-medium shadow-lg hover:bg-indigo-600 transition-all ease-in-out duration-200 ml-10"
                  >
                    OKAY
                  </button>
                </div>
              )}

              {/* Display Price and Confirm Button */}
              {isPriceFetched && (
                <>
                  <div className="mt-4">
                    <p className="text-lg font-semibold text-gray-700 ml-10">
                      Estimated Price: ₹{price}
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={handleConfirmClick}
                      className="w-3/4 p-3 rounded-lg bg-green-500 text-white font-medium shadow-lg hover:bg-green-600 transition-all ease-in-out duration-200 ml-10"
                    >
                      CONFIRM
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Passenger Details Section */}
          {showPassengerDetails && (
            <div className="flex w-full h-full px-6 mt-4 flex-col rounded-xl bg-white shadow-lg">
              {/* First Section: Profile, Name, Streak, Rating */}
              <div className="w-full h-3/4 rounded-xl border border-gray-300 flex flex-col overflow-hidden mt-7">
                <div className="w-full h-1/3 flex border-b border-gray-200">
                  <div className="w-3/10 h-full flex justify-center items-center p-4">
                    <img
                      src="https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg"
                      alt="Profile"
                      className="w-38 h-38 rounded-full object-cover shadow-md"
                    />
                  </div>

                  <div className="w-7/10 h-full flex flex-col p-4">
                    <div className="w-full h-2/3 flex items-center text-left justify-center">
                      <span className="text-5xl font-bold text-gray-800 font-sans">Narayan Murthy</span>
                    </div>

                    <div className="w-full h-1/3 flex justify-center items-center mt-10">
                      <span className="text-l text-yellow-500 mr-50 font-semibold font-sans">Rating: 4.5/5</span>
                      <span className="text-l text-gray-600 font-semibold font-sans">Streak: 5 days</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-1/3 flex border-b border-gray-200">
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-4xl text-gray-700">Drop-off Location</span>
                  </div>
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-4xl text-gray-700">Pickup Location</span>
                  </div>
                </div>

                <div className="w-full h-1/3 flex">
                  <div className="w-1/2 h-full flex justify-center items-center p-4 border-r border-gray-200">
                    <span className="font-semibold text-gray-800 text-2xl">Fare: ₹250</span>
                  </div>
                  <div className="w-1/2 h-full flex justify-center items-center p-4">
                    <span className="text-2xl font-semibold text-gray-800">ETA: 15 min</span>
                  </div>
                </div>
              </div>

              {/* CANCEL button */}
              <div className="w-full h-12 flex justify-center items-center py-2">
                <button
                  onClick={handleCancelRide}
                  className="w-3/3 bg-gradient-to-r from-red-500 to-red-700 text-white font-medium px-6 py-2 rounded-full shadow-lg transform transition duration-200 hover:scale-101 hover:bg-red-600 focus:outline-none mt-10"
                >
                  CANCEL
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1/6 flex flex-col justify-center items-center py-6">
                <div className="w-full bg-gray-200 h-8 rounded-full overflow-hidden relative items-center flex">
                  {[10, 20, 30, 40].map((num, index) => (
                    <span
                      key={index}
                      className="absolute transform -translate-x-1/2 text-sm font-semibold text-white"
                      style={{ left: `${(index + 1) * 20}%` }}
                    >
                      {num}
                    </span>
                  ))}
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700" style={{ width: `${(progressWidth / 50) * 100}%` }}></div>
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-2xl text-white font-bold">
                    🏆
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverHome;
