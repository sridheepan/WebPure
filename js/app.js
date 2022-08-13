let equipmentTypeList = [];

const apiURL = "assets/campsites.json";

// fetch json data
const getCampSites = async () => {
    try{
        const resultFromAPI = await fetch(apiURL);
        const jsonData = await resultFromAPI.json();

        fetchEquipmentType(jsonData);
        setEquipmentTypeDropdown();
        setNightsDropdown();
    }
    catch(err){
        console.log(`Error while fetching data from API: ${err}`);

    }
}
getCampSites();

//store campsite data to an array
const fetchEquipmentType = (responseData) => {
    for (let i = 0; i < responseData.length; i++){
        let equipmentTypes = responseData[i].equipment;
        for(let j = 0; j < equipmentTypes.length; j++){
            if(!equipmentTypeList.includes(equipmentTypes[j])){
                equipmentTypeList.push(equipmentTypes[j])
            }
        }
    }
};

const setEquipmentTypeDropdown = () => {
    document.querySelector("#equipments").innerHTML = `<option value="showall">Show All</option>`;
    for (let i = 0; i < equipmentTypeList.length; i++) {
        document.querySelector("#equipments").innerHTML += `<option value="${equipmentTypeList[i]}">${equipmentTypeList[i]}</option>`;
    }
}

const setNightsDropdown = () => {
    for (let i = 1; i < 11; i++) {
        document.querySelector("#nights").innerHTML += `<option value="${i}">${i}</option>`;
    }
}

const reserveCampsiteClicked = () => {
    console.log("Goto Screen #2, write logic to display sites");

    //get selected values from dropdown
    const eqType = document.getElementById("equipments").value;
    const nights = document.getElementById("nights").value;

    location.href = `/campsites.html?eqType=${eqType}&nights=${nights}`;
}

// Event Listners
document.querySelector("#reserve").addEventListener("click", reserveCampsiteClicked);
