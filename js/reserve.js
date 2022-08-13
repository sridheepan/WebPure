const jsonPath = "assets/campsites.json"
const totalNights = 10;
let availableNights;
let currSite
// read json file
const getCampSite = async(id) => {
    try{    
        const reader = await fetch(jsonPath);
        let campSites = await reader.json();

        // find camp object in array
        let camp = campSites.find(camp => camp.siteNumber == id);
        // if found set page content
        if(camp != null) {
            currSite = camp
            setPageContent(camp)
        }
        
    }catch (err){
        console.log(`error while fetching data from file : ${err}`);
    }
};

//getting camp ID from URL
const getSearchParams = () =>{
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('campID');

    let campID = id;

    return campID;
}

const getCampObj = () => {
    camp = campSites.find(camp => camp.siteNumber == id);
    return camp;
}

const setPageContent = (camp) => {
    availableNights = getAvailableNights(camp);
    const infoContainerElement = document.querySelector("#site-information");

    infoContainerElement.innerHTML += 
        `<h4>1. Site Information</h4>
        <p>Site ${camp.siteNumber}</p>
        <p>Equipment: ${camp.equipment}</p>
        <p>
            <span class="featureIcons">
            <i class="bi bi-star-fill" style="display:${camp.isPremium ? 'inline': 'none'}"></i>
            <i class="bi bi-plug-fill" style="display:${camp.hasPower ? "inline": "none"}"></i>
            <i class="bi bi-broadcast" style="display:${camp.isRadioFree ? "none": "inline"}"></i>
            </span>
        </p>
        <p>Availabilty: ${availableNights} of ${totalNights} days</p>`;

        document.getElementById("booked_nights").setAttribute("max",availableNights);


}

const getAvailableNights = (camp) => {
    let bookedNights = localStorage.getItem(camp.siteNumber);
    return totalNights - bookedNights;

}

const getAvailableNightsByCampNumber = (campId) => {
    let bookedNights = localStorage.getItem(campId);
    return totalNights - bookedNights;

}

const showReceipt = (name = "", email = "", nights = 1) => {
    console.log();
    //generate random number
    let receiptNumber = "#RES-"+ Math.floor(1000 + Math.random() * 9000);
    console.log(currSite);

    let [nightly_rate, subtotal, tax, total] = getCostBreakdown(nights);
    
    const infoContainerElement = document.querySelector("#reservation-container")
    infoContainerElement.innerHTML = "";

    infoContainerElement.innerHTML += `
    <p class="heading">Reservation ${receiptNumber}</p>
            <div class="receipt-container">
                <div class="keys">
                    <p>Name:</p>
                    <p>Email:</p>
                    <hr>
                    <p>Number of Nights:</p>
                    <p>Nightly Rate:</p>
                    <p>Subtotal:</p>
                    <p>Tax:</p>
                    <hr>
                    <p>Total:</p>
                </div>
                <div class="values">
                    <p>${name}</p>
                    <p>${email}</p>
                    <hr>
                    <p>${nights}</p>
                    <p>$${nightly_rate.toFixed(2)}</p>
                    <p>$${subtotal.toFixed(2)}</p>
                    <p>$${tax.toFixed(2)}</p>
                    <hr>
                    <p>$${total.toFixed(2)}</p>
                </div>
            </div>
            <div class="reserve-btn-container">
                ${getAvailableNights(currSite) > 0 ? '<button class="btn-round" id="book_again" onclick="reloadPage()" >Book Again</button>' : ''}
                <button class="btn-round" id="home" onclick="goToHomepage()" >Go To Homepage</button>
            </div>`;
}

const getCostBreakdown = (nights) => {
    let nightly_rate = 47.50;
    if (currSite.isPremium) {
        nightly_rate = nightly_rate + (nightly_rate * 0.20);
    }
    if (currSite.hasPower) {
        nightly_rate = nightly_rate + 5;
    }

    let subtotal = nightly_rate * nights;
    let tax  = subtotal * 0.13;
    let total = subtotal + tax;

    let costArr = [nightly_rate, subtotal, tax, total];

    return costArr;
}

//execute when DOM loads
const pageLoaded = () => {
    let campID = getSearchParams();
    
    if(campID === null || getAvailableNightsByCampNumber(campID) <= 0){
        document.getElementById("reservation-container").style.display = "none";
        document.getElementById("error-container").style.display = "block";
    }
    else{
        getCampSite(campID);
    }
}

const reserveCampsite = () => {
    let nightsError = false;
    let nameError = false;
    let emailError = false;

    const nights = document.getElementById("booked_nights").value;
    const name = document.getElementById("guest_name").value;
    const email = document.getElementById("guest_email").value;

    if(nights > availableNights || nights < 1){
        document.getElementById("booked_nights_error").innerText = `Nights must be between 1 and ${availableNights}`;
        document.getElementById("booked_nights_error").style.display = "block";
        nightsError = true;
    }
    else{
        document.getElementById("booked_nights_error").style.display = "none";
        nightsError = false;
    }

    if (name == "") {
        document.getElementById("guest_name_error").innerText = `Name is mandatory`;
        document.getElementById("guest_name_error").style.display = "block";
        nameError = true;
    }
    else{
        document.getElementById("guest_name_error").style.display = "none";
        nameError = false;
    }

    if (email == "") {
        document.getElementById("guest_email_error").innerText = `Email is mandatory`;
        document.getElementById("guest_email_error").style.display = "block";
        emailError = true;
    }
    else{
        if(emailValidation(email)){
            document.getElementById("guest_email_error").style.display = "none";
            emailError = false;
        }
        else{
            document.getElementById("guest_email_error").innerText = `Enter valid email address`;
            document.getElementById("guest_email_error").style.display = "block";
            emailError = true;
        }
    }

    if(nightsError == false && nameError == false && emailError == false){
        // save nights booked to localstorage
        saveToLocalStorage(currSite.siteNumber, nights);

        // hide form and show receipt
        showReceipt(name, email, nights);
    }
    else{
        return false;
    }
}

const saveToLocalStorage = (campID, nightsBooked) => {
    if (localStorage.hasOwnProperty(campID) === true){
        let nightInStorage = localStorage.getItem(campID);
        let nightsToUpdate = parseInt(nightInStorage) + parseInt(nightsBooked);
        
        localStorage.setItem(campID, nightsToUpdate)
    }
    else{
        localStorage.setItem(campID, nightsBooked)
    }
    
}

const goToHomepage = () => {
    location.href = `/index.html`;
}

const reloadPage = () => {
    location.reload();
}
const emailValidation = (email) => {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(email.match(validRegex)) {
        return true;
    }
    return false;
}

document.addEventListener("DOMContentLoaded", pageLoaded);
document.querySelector("#reserve_campsite").addEventListener("click", reserveCampsite);
