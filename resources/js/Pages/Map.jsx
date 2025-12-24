import { useEffect } from "react";

export default function Map() {
  useEffect(() => {
    // Define the callback for Google Maps
    window.initMap = () => {
      const center = { lat: 40.7128, lng: -74.0060 }; // Example: New York
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: center,
      });

      // Add a marker
      new window.google.maps.Marker({
        position: center,
        map: map,
        title: "Hello, New York!",
      });
    };

    // Dynamically load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAoFV_A6GK86i6GR3w3RoKKbsWkgO1ezNo&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div id="map" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}
