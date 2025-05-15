"use strict"

//skapar variablar av knapp elementen i html
let openButton = document.getElementById("open-menu")
let closeButton = document.getElementById("close-menu")


//skapar en eventlistener som lyssnar efter när användare klickar på dessa element
openButton.addEventListener('click', toggleMenu)
closeButton.addEventListener('click', toggleMenu)
//function som kollar ifall mobilmenyn visas eller inte när man trycker på respektive knapp, om den inte visas så visas den och vice versa. Den ändrar knappens css ifall display är none till block annars ändras den till none
function toggleMenu(){
    let mobileMenuEl = document.getElementById("mobilemenu")
    let style = window.getComputedStyle(mobileMenuEl)

    if(style.display === "none") {
        mobileMenuEl.style.display = "block";
    } else{
        mobileMenuEl.style.display = "none"
    }
}

/**
 * Hämtar sökknappen och lägger till en eventlistener för att anropa sökfunktionen
 * @constant {HTMLElement} searchBut - Sökknappen i DOM
 */
const searchBut = document.getElementById('searchbut')
searchBut.addEventListener('click', searchlocation)

/**
 * Funktion för att söka i kartan med hjälp av Openstreetmaps nominatim API
 * @async
 * @function searchlocation
 */

async function searchlocation(){
    //Hämtar användarens inmatning från textfältet
    let location = document.getElementById('locationinput').value;
    
    try{
        //Hämtar API baserat på vad användaren matat in
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);

        if (!response.ok){
            throw new Error ('Nätverksproblem - felaktigt svar från servern');
        }
    
    //omvandlar API-svaret till JSON
    
    const data = await response.json();
    
    //Latitude från platsen, parsefloat för att parsea strängen till ett nummer
     
    let lat = parseFloat(data[0].lat)
    let lon = parseFloat(data[0].lon)
    /**
     * iframe elementet där kartan visas
     * @constant {HTMLElement} map - iframe i DOM
     */
    let map = document.getElementById('mapcont')
    let loader = document.getElementById('loader')

    loader.classList.remove('hidden')
    /**
     * Url som visarr kartan i iframen beserat på det hämtade korodinaterna
     * @constant {string} map.src - OpenStreetMap inbäddad kart url
     */
    map.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`

    map.onload = () => {
        loader.classList.add('hidden')
    }

    getWeatherData(lat, lon)

    } catch (error){
        console.error('Det uppstod ett fel:', error.message);

    }
}
/**
 * Hämtar väderdatan från det meteorologiska institutet i norge med angiven longitud och latitud tagen från funktionen searchlocation()
 * Om inga fel uppstår skickas datan vidare till displayweatherforecast()
 * 
 * @async
 * @function
 * @param {number} lat - Latitud for platsen 
 * @param {number} lon - Longitud för platsen
 */
async function getWeatherData(lat, lon){
    try{
        const response = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, {
            headers:{
                'User-Agent': 'sape2402@student.miun.se'
            }
        });

        if (!response.ok){
            throw new Error ('Nätverksproblem - felaktigt svar från servern');
        }

    const data = await response.json();
    displayWeatherforecast(data);
    } catch (error){
        console.error('Det uppstod ett fel:', error.message);
    }
}

/**
 * Visar det kommande 24-timmars väderprognos i en HTML-Tabell
 * 
 * @function
 * @param {Object} data - JSON-data från norges meteorologiska instituts väder-API
 * @param {Object[]} data.properties.timeseries - Array med väderprognoser per timme
 */

function displayWeatherforecast(data){
    const hours = data.properties.timeseries.slice(0, 24)
    const tableBody = document.querySelector('#weatherTable tbody');

    tableBody.innerHTML = '';

    hours.forEach(forecast => {
        const time = new Date(forecast.time).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})
        const temp = forecast.data.instant.details.air_temperature;

        //Kollar om regndata finns för nästa timme, annars nästa 6 timmar om ingen finns visas 0 mm
        const rain = forecast.data.next_1_hours?.details?.precipitation_amount ??
                    forecast.data.next_6_hours?.details?.precipitation_amount ??
                    0;

        const row = document.createElement('tr')

        const timeCell = document.createElement('td')
        timeCell.textContent = time 
        const tempCell = document.createElement('td')
        tempCell.textContent = temp + ' °C'
        const rainCell = document.createElement('td')
        rainCell.textContent = rain + ' mm'
        
        row.appendChild(timeCell)
        row.appendChild(tempCell)
        row.appendChild(rainCell)

        tableBody.appendChild(row)
    });   
}



