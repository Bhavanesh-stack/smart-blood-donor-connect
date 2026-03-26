// ===== LEAFLET MAP MODULE =====

let map = null;
let markersLayer = null;
let userMarker = null;

function initMap(lat, lng, elementId = 'map') {
  if (map) {
    map.remove();
  }

  map = L.map(elementId).setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Use MarkerClusterGroup if available, otherwise standard layer group
  if (typeof L.markerClusterGroup === 'function') {
    markersLayer = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count >= 10) size = 'medium'; 
        if (count >= 20) size = 'large';
        return L.divIcon({
          html: `<div style="
            background: linear-gradient(135deg, #DC2626, #B91C1C);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 14px;
            font-family: Inter, sans-serif;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(220,38,38,0.4);
          ">${count}</div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(44, 44)
        });
      }
    });
  } else {
    markersLayer = L.layerGroup();
  }
  
  markersLayer.addTo(map);

  return map;
}

function addDonorMarker(donor) {
  if (!map || !markersLayer) return;

  const redIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: linear-gradient(135deg, #DC2626, #B91C1C);
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    "><span style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">${donor.bloodGroup.charAt(0)}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  const distText = donor.distance !== undefined ? `${donor.distance} km away` : '';
  const initials = donor.name ? donor.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';

  const popupContent = `
    <div style="font-family: Inter, sans-serif; min-width: 220px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #DC2626, #B91C1C); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(220,38,38,0.3);">${initials}</div>
        <div>
          <strong style="font-size: 15px; color: #1F2937;">${donor.name}</strong>
          <div style="font-size: 12px; color: #6B7280; margin-top: 2px;">${distText}</div>
        </div>
        <div style="margin-left: auto; background: ${donor.bloodGroup.startsWith('O') ? '#DC2626' : donor.bloodGroup.startsWith('A') ? '#2563EB' : donor.bloodGroup.startsWith('B') ? '#7C3AED' : '#D97706'}; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;">${donor.bloodGroup}</div>
      </div>
      <div style="font-size: 13px; color: #4B5563; margin-bottom: 10px; padding: 8px; background: #F9FAFB; border-radius: 8px;">
        📍 ${donor.location?.city || 'Unknown location'}
      </div>
      <button onclick="window.requestBloodFromDonor && window.requestBloodFromDonor('${donor.id}')"
        style="width: 100%; padding: 10px; background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 13px; font-family: Inter, sans-serif; box-shadow: 0 2px 8px rgba(220,38,38,0.3); transition: transform 0.15s ease;"
        onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
        🩸 Request Blood
      </button>
    </div>
  `;

  const marker = L.marker([donor.location.lat, donor.location.lng], { icon: redIcon })
    .bindPopup(popupContent);

  markersLayer.addLayer(marker);
  return marker;
}

function addUserMarker(lat, lng) {
  if (!map) return;
  if (userMarker) {
    map.removeLayer(userMarker);
  }

  const blueIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: linear-gradient(135deg, #2563EB, #1d4ed8);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 12px rgba(37, 99, 235, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    "><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  userMarker = L.marker([lat, lng], { icon: blueIcon })
    .bindPopup('<strong style="font-family: Inter, sans-serif;">📍 You are here</strong>')
    .addTo(map);

  return userMarker;
}

function clearMarkers() {
  if (markersLayer) {
    markersLayer.clearLayers();
  }
}

function fitMapToBounds(donors, userLat, userLng) {
  if (!map) return;
  const points = [[userLat, userLng]];
  donors.forEach(d => {
    if (d.location) points.push([d.location.lat, d.location.lng]);
  });
  if (points.length > 1) {
    map.fitBounds(points, { padding: [40, 40] });
  }
}
