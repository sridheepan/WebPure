let equipmentTypeList = [];
let numberOfNights = [];
let totalNights = 10;
const jsonPath = "assets/campsites.json"
let campSites;


// read json file
const getCampSiteList = async() => {
    try{
        const searchParam = getSearchParams();
    
        const reader = await fetch(jsonPath);
        campSites = await reader.json();
        
        setAvailableNightsInCampsite(campSites);
        console.log(numberOfNights);
        fetchEquipmentType(campSites);
        setEquipmentTypeDropdown();
        setNightsDropdown();
        setSearchParams(searchParam);

        if(searchParam.eqType === null || searchParam.eqType === ""){
            showCampsites();
        }
        else{
            showCampsites(true, true, "eqType", searchParam.eqType);
        }
        
    }catch (err){
        console.log(`error while fetching data from file : ${err}`);
    }
};


//show all campsites
const showCampsites = (filterBoth = false, filter = false, filterType = "", filterValue = "", ) => {
    let filteredCampSites = campSites;

    if(filterBoth){
        filteredCampSites = getFilteredCampSitesByBoth();
    }
    else{
        if(filter){
            filteredCampSites = getFilteredCampSites(filterType, filterValue);
        }
    }
    
    console.log(filteredCampSites);
    const containerElement = document.querySelector("#campsite-list")
    containerElement.innerHTML = ``;
    for (let i = 0; i < filteredCampSites.length; i++) {
        let bookedNights = 0;
        let availabilityHtml = ``;
        
        if (numberOfNights.some(elem => elem.siteNumber === filteredCampSites[i].siteNumber)){
            
            let curIndex = numberOfNights.findIndex(elem => elem.siteNumber === filteredCampSites[i].siteNumber);
            if (curIndex !== -1){
                let curObj = numberOfNights[curIndex];
                totalNights = curObj.totalNights;
                bookedNights = (localStorage.getItem(curObj.siteNumber) == null) ? 0 : parseInt(localStorage.getItem(curObj.siteNumber));
                console.log(totalNights, bookedNights)
                
                availabilityHtml = generateAvailableNightHtml(filteredCampSites[i].siteNumber, totalNights, bookedNights);
            }
        }
        
        containerElement.innerHTML += `
        <div class="row">
            <div>
                <img src="${filteredCampSites[i].image}" alt="image"/>
            </div>
            <div>
                <p class="siteNumber">Site ${filteredCampSites[i].siteNumber}</p>
                <p class="equipments">Equipment: ${filteredCampSites[i].equipment}</p>
                ${availabilityHtml}
                <p>SITE FEATURES</p>
                <span class="featureIcons" id=featureIcons_${filteredCampSites[i].siteNumber}">
                    <i class="bi bi-star-fill" style="display:${filteredCampSites[i].isPremium ? 'inline': 'none'}"></i>
                    <i class="bi bi-plug-fill" style="display:${filteredCampSites[i].hasPower ? "inline": "none"}"></i>
                    <i class="bi bi-broadcast" style="display:${filteredCampSites[i].isRadioFree ? "none": "inline"}"></i>
                </span>
            </div>
            <div class="btn-container">
                <button class="btn-round" onclick="makeReservation(${filteredCampSites[i].siteNumber})" ${bookedNights>=totalNights ? "disabled" : ""}>Book Now</button>
            </div>
        </div>
        `
    };
}


//set available nights in campSites
const setAvailableNightsInCampsite = (data) => {
    for (let i = 0; i < data.length; i++){
        let campsite = {siteNumber: data[i].siteNumber, bookedNights: 0, totalNights:10};
        numberOfNights.push(campsite);
    }
}

const generateAvailableNightHtml = (siteNumber, totalNights, bookedNights) => {
    let availableNights = totalNights - bookedNights;
    let htmlContent = `<p class="availablityDays_${siteNumber}">AVAILABILITY: ${availableNights} OF ${totalNights} DAYS</p>`;
    htmlContent += `<span class="d-block" id="availablityIcons_${siteNumber}">`;

    for(let i=0; i<totalNights; i++){
        if(i<bookedNights){
            htmlContent += `<i class="bi bi-x-circle"></i>`;
        }
        else{
            htmlContent += `<i class="bi bi-circle"></i>`;
        }
    }
    htmlContent += `</span>`;

    return htmlContent;
}

//store campsite data to an array
const fetchEquipmentType = (data) => {
    for (let i = 0; i < data.length; i++){
        let equipmentTypes = data[i].equipment;
        for(let j = 0; j < equipmentTypes.length; j++){
            if(!equipmentTypeList.includes(equipmentTypes[j])){
                equipmentTypeList.push(equipmentTypes[j])
            }
        }
    }
};

const setEquipmentTypeDropdown = () => {
    document.querySelector("#equipments").innerHTML = `<option value="">Show All</option>`;
    for (let i = 0; i < equipmentTypeList.length; i++) {
        document.querySelector("#equipments").innerHTML += `<option value="${equipmentTypeList[i]}">${equipmentTypeList[i]}</option>`;
    }
}

const setNightsDropdown = () => {
    document.querySelector("#nights").innerHTML += `<option value="">Select Night</option>`;
    for (let i = 1; i < 11; i++) {
        document.querySelector("#nights").innerHTML += `<option value="${i}">${i}</option>`;
    }
}

//getting search parameters from URL
const getSearchParams = () => {
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const eqType = urlParams.get('eqType');
    const nights = urlParams.get('nights');

    let searchParam = {eqType: eqType, nights: nights};
    return searchParam;
}

//setting search parameters in dropdowns
const setSearchParams = (searchParam) => {
    let eqType = searchParam.eqType;
    let nights = searchParam.nights;
    
    if(eqType !== ""){
        if(equipmentTypeList.includes(eqType)){
            document.getElementById("equipments").value = eqType;
        }
    }

    if(nights !== "" && nights > 0 && nights < 11){
        document.getElementById("nights").value = nights;
    }
}

const equipmentFilterChanged = (evt) =>{
    document.getElementById("nights").selectedIndex = 0;
    const selectedEqType = document.querySelector("#equipments").value;
    console.log(selectedEqType);
    if(selectedEqType === ""){
        showCampsites();
    }
    else{
        showCampsites(false, true, "eqType", selectedEqType);
    }
}

const nightsFilterChanged = () => {
    document.getElementById("equipments").selectedIndex = 0;
    console.log("nights filter triggered");
    const selectedNights = document.querySelector("#nights").value;
    console.log(selectedNights);
    if(selectedNights === ""){
        showCampsites();
    }
    else{
        showCampsites(false, true, "nights", selectedNights);
    }
}

const getFilteredCampSitesByBoth = () => {
    const searchParam = getSearchParams();
    const filterdEqType = searchParam.eqType;
    const filterdNight = searchParam.nights;
    let filteredList = [];

    console.log(filterdEqType);
    console.log(filterdNight);

    for (let i = 0; i < campSites.length; i++){
        let equipmentTypes = campSites[i].equipment;
        let bookedNights = localStorage.getItem(campSites[i].siteNumber);

        if(filterdEqType == "Single Tent" || filterdEqType == "showall"){
            console.log(bookedNights);
            if(bookedNights !== null){
                let availableNights = totalNights - bookedNights;
                if(filterdNight <= availableNights){
                    filteredList.push(campSites[i]);
                }
            }
            else{
                filteredList.push(campSites[i]);
            }
        }
        else if(filterdEqType == "3 Tents"){
            if(equipmentTypes.includes(filterdEqType) || equipmentTypes.includes("Trailer up to 18ft")){
                if(bookedNights !== null){
                    let availableNights = totalNights - bookedNights;
                    if(filterdNight <= availableNights){
                        filteredList.push(campSites[i]);
                    }
                }
                else{
                    filteredList.push(campSites[i]);
                }
            }
        }
        else if(filterdEqType == "Trailer up to 18ft"){
            if(equipmentTypes.includes(filterdEqType)){
                if(bookedNights !== null){
                    let availableNights = totalNights - bookedNights;
                    if(filterdNight <= availableNights){
                        filteredList.push(campSites[i]);
                    }
                }
                else{
                    filteredList.push(campSites[i]);
                }
            }
        }
    }
    return filteredList;
}

const getFilteredCampSites = (filterType, filterValue) => {
    let filteredList = [];

    for (let i = 0; i < campSites.length; i++){
        if(filterType == "eqType"){
            let equipmentTypes = campSites[i].equipment;
            if(filterValue == "Single Tent"){
                    filteredList.push(campSites[i]);
            }
            else if(filterValue == "3 Tents"){
                if(equipmentTypes.includes(filterValue) || equipmentTypes.includes("Trailer up to 18ft")){
                    filteredList.push(campSites[i]);
                }
            }
            else if(filterValue == "Trailer up to 18ft"){
                if(equipmentTypes.includes(filterValue)){
                    filteredList.push(campSites[i]);
                }
            }
        }
        else if(filterType == "nights"){
            let bookedNights = localStorage.getItem(campSites[i].siteNumber);
            if(bookedNights !== null){
                let availableNights = totalNights - bookedNights;
                if(filterValue <= availableNights){
                    filteredList.push(campSites[i]);
                }
            }
            else{
                filteredList.push(campSites[i]);
            }
        }
    }

    return filteredList;
}

const makeReservation = (campID) => {
    console.log(campID)
    location.href = `/reserve.html?campID=${campID}`;
}

//execute when DOM loads
const pageLoaded = () => {
    getCampSiteList();
}

const searchCampSites = () => {
    getCampSiteList();
}

// Event Listners
document.addEventListener("DOMContentLoaded", pageLoaded);
document.getElementById("equipments").addEventListener("change", equipmentFilterChanged);
document.getElementById("nights").addEventListener("change", nightsFilterChanged);