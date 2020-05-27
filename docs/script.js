// Variables
var apiKey = '16ab08b28b48ad054184be3923b61332';
var units = 'metric';
var arr = [];

// Initial DOM assignments
const app = document.getElementById('root');
const button = document.getElementById('button');
const formWrapper = document.getElementById('form-wrapper');
document.body.classList.toggle('overflow');

button.onclick= () => {
  location.reload(true);
};

//Form Assignments
var form = document.getElementById("myForm");
function handleForm(event) {
  event.preventDefault(); } 
  form.addEventListener('submit', handleForm);

    function saveInput() {
      try {formWrapper.classList.toggle('hide');
      app.classList.toggle('hide');
      document.body.classList.toggle('overflow');
        var cityName = document.getElementById("cityName").value;
        var state = document.getElementById("state").value;

        var apiCall= `https://api.openweathermap.org/data/2.5/forecast?q=${cityName},${state}&units=${units}&appid=${apiKey}`;

// Get data from Openw Weather
var request = new XMLHttpRequest(); 

// Use request call with false = synchonous then true = asynchonus with call
request.open("GET", apiCall, false);


request.onreadystatechange = () => {

  var data = JSON.parse(request.responseText);
  var cityName = data.city.name;
  state = data.city.country;

  if (request.status >= 200 && request.status < 400) {
      arr = data['list'].map(value => { 

      return [value.dt,value.main.feels_like, value.rain, value.snow, value.main.temp,value.weather[0]['icon'],value.weather[0]['description'],value.weather[0]['main']];
    });
 }
  else{
      console.log("The city doesn't exist! Check again");
 }
};
request.send();


// Thermal equilibrium equation (Wikipedia)
// Tsub = 33.5 - 3Iclo - (0.08+0.05Iclo)*H

// Thermal comfort variables
var inThermInsul = 0.67; // Initial full clothing ensemble in clos
var cloRemain = [];
const insulIndex = {
  0: 'No Need!',
  0.3:'Sweater',
  1.1: 'Light/Medium Jacket & Sweater',
  4.0: 'Heavy Jacket or Winter Coat'
};

// Get remaining R values based on weather
for (let i in arr){
  let heatGen = 120; //Metabolic heat production for walking of an avg person(W/m2)
  let rRemain = (arr[i][1] - 31)/(-0.155*heatGen) - inThermInsul;
  cloRemain.push(Number(rRemain.toFixed(1)));
}

// Get type of weather based on 9 hour average forecast
var tempMin = Math.min(...cloRemain.slice(0,3));
var insulIndexKeys = Object.keys(insulIndex).sort();

for (let i in insulIndexKeys){
  if (tempMin <= insulIndexKeys[i]){
      var sweaterResult = insulIndex[insulIndexKeys[i]];
      break;
  }
}

// Rainfall and snowfall warning.if greater than light loads per hour 
var rainfallResult = 'No Problem!';
var snowfallResult ='No Problem!';
var nineHourArr = arr.slice(0,4);

nineHourArr[0][7] == 'Thunderstorm' || nineHourArr[0][7] == 'Drizzle' ||
nineHourArr[0][7] == 'Rain' ? document.body.style.backgroundImage= 'url("Images/rain.jpg")':
nineHourArr[0][7] == 'Snow'? document.body.style.backgroundImage = 'url("Images/snow.jpg")':
nineHourArr[0][7] == 'Atmosphere' || nineHourArr[0][7] == 'Clouds'? 
document.body.style.backgroundImage = 'url("Images/cloudy.jpg")': document.body.style.backgroundImage='url("Images/sunny.jpg")';

for (let i in nineHourArr){
  if(typeof nineHourArr[i][2] == 'object' && nineHourArr[i][2]['3h']/3 > 2.5){
      rainfallResult = 'Warning, Will Rain!';
  }
  else if (typeof nineHourArr[i][3] == 'object' && nineHourArr[i][3]['3h']/3 > 12.7){
      snowfallResult = 'Warning, Will Snow!';
  }
}

// h2 heading
  const h2Wrapper = document.createElement('div');
  h2Wrapper.setAttribute('id','h2-wrapper');
  h2Wrapper.style.opacity = 0.8;

  const city = document.createElement('h2');
      city.textContent = `City: ${cityName.toUpperCase()}, ${state.toUpperCase()}`

  const h2Head = document.createElement('h2');
      h2Head.textContent = `Extra Clothing: ${sweaterResult}`;

  const h2Head2 = document.createElement('h2');
      h2Head2.textContent = `Rainfall: ${rainfallResult}`;

  const h2Head3 = document.createElement('h2');
      h2Head3.textContent = `Snowfall: ${snowfallResult}`;

      h2Wrapper.appendChild(city);
      h2Wrapper.appendChild(h2Head);
      h2Wrapper.appendChild(h2Head2);
      h2Wrapper.appendChild(h2Head3);

// Setting parent-child relationships
const container = document.createElement('div');
container.setAttribute('class','container');

app.appendChild(h2Wrapper);
app.appendChild(container);

// Times and weather data
nineHourArr.forEach(value => {
  const card = document.createElement('div');
  card.setAttribute('class','card');

  const h1 = document.createElement('h1');
  h1.style.backgroundColor = '#e0fbfc';
  let hours = new Date(value[0]*1000).getHours();

  if(hours > 12){
    h1.textContent = `${hours-12}:00 PM`;
  } else {
    h1.textContent = `${hours}:00 AM`;
  }

  const weatherIcon = document.createElement('img');
  weatherIcon.src = `http://openweathermap.org/img/wn/${value[5]}@2x.png`;

  const description = document.createElement('h6');
  description.textContent = `${value[6].toUpperCase()}`;

  const p1 = document.createElement('p');
  p1.textContent = `${value[4].toFixed(1)} °C`;

  const p2 = document.createElement('p');
  const p3 = document.createElement('p');

  typeof value[2] == 'object'? p2.textContent = `Rainfall: ${value[2]['3h']} mm`
  : p2.textContent = `Rainfall: 0 mm`;
  typeof value[3] == 'object'? p3.textContent = `Snowfall: ${value[3]['3h']} mm`
  : p3.textContent = `Snowfall: 0 mm`;

  container.appendChild(card);
  card.appendChild(h1);
  card.appendChild(weatherIcon);
  card.appendChild(description);
  card.appendChild(p1);
  card.appendChild(p2);
  card.appendChild(p3);
});

const footer = document.createElement('footer');
const copyright = document.createElement('p');
copyright.setAttribute('id','copyright');
copyright.textContent = ` \u00A9 Bryan Wong | 2020`;

app.appendChild(footer);
footer.appendChild(copyright);}catch(err){
  alert('Invalid City or Country. Try Again.');
  location.reload(true);
}

};