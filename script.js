// Get DOM elements
const advancedOptionsCheckbox = document.getElementById('advanced-options');
const advancedFields = document.getElementById('advanced-fields');
const form = document.getElementById('cost-estimator-form');
const hideform = document.getElementById('hide_form');
const formSection = document.getElementById('form-section');
const resultCard = document.getElementById('result-card');
const resultTitle = document.getElementById('result-title');
const resultText = document.getElementById('result-text');
const printPdf = document.getElementById('printPdf');
// Toggle visibility of advanced fields based on checkbox state
advancedOptionsCheckbox.addEventListener('change', () => {
    advancedFields.classList.toggle('hidden');
});

// Form submission event
document.getElementById('submit_btn').addEventListener('click', (e) => {
    e.preventDefault();

    // Get form data using FormData
    const formData = new FormData(form);

    const advancedOptions = formData?.get('advanced-options') === 'on';
    const location = formData?.get('location');
    const userUnitReq = formData?.get('units'); // User Input

    // Fetch data from the server based on the selected location
    fetch(`http://localhost:5000/api/state/${location}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Update localSolPower and localSolArrRate with fetched data
            const { state, localSolPower, localSolArrRate} = data;
           const userPowerReqPerDay = (userUnitReq * 1.5)/30; // 1.5 = peak power adjustment
    const batteryCap = 0.8 * userPowerReqPerDay; // Batery req = 3x daily capacity (3D support)

    const batteryCost = batteryCap * 33000; // MongoDB Database Battery Table - Argument = batteryCap

    const solArrAreaReq = parseFloat((userPowerReqPerDay / parseFloat(localSolPower)).toFixed(2));
    const solArrCost = Math.floor(solArrAreaReq * parseFloat(localSolArrRate));
          
    
    const totalCostOfSetup = batteryCost + solArrCost; // Total cost = battery + solar array
    let UserBill, recoveryTimeY, recoveryTimeM, UserBillFixed, UserBill100, UserBill300, UserBill500, UserBill500Plus;
    if(!advancedOptions){
        UserBill = formData?.get('cost'); // User Input basic

        // Recovery of Payment
        const basicBillRec = totalCostOfSetup/(UserBill*0.9) //Exclude Fixed cost on 10% assumption 

        recoveryTimeY = Math.floor(basicBillRec/12);
        recoveryTimeM = Math.floor(basicBillRec-12*recoveryTimeY);
    }
    else{
        UserBillFixed = advancedOptions ? document.getElementById('fixed-cost').value : ''; // Advanced User Input
        UserBill100 =  advancedOptions ? document.getElementById('cost-per-unit-100').value : ''; // Advanced User Input
        UserBill300 = advancedOptions ? document.getElementById('cost-per-unit-300').value : ''; // Advanced User Input
        UserBill500 = advancedOptions ? document.getElementById('cost-per-unit-500').value : ''; // Advanced User Input
        UserBill500Plus = 50; // Advanced User Input
        
        // Advanced
        let remainingReq = userUnitReq;
        let totalAdvBillSavings = 0;
        if(remainingReq>100){
            totalAdvBillSavings+=100*UserBill100;
            remainingReq-=100;
            if(remainingReq>200){
                totalAdvBillSavings+=200*UserBill300;
                remainingReq-=200;
                if(remainingReq>200){
                    totalAdvBillSavings+=200*UserBill500;
                    remainingReq-=200;
                    if(remainingReq>0){
                        totalAdvBillSavings+=remainingReq*UserBill500Plus;
                        remainingReq=0;
                    }
                }
                else{
                    totalAdvBillSavings+=remainingReq*UserBill500;
                    remainingReq=0;
                }
            }
            else{
                totalAdvBillSavings+=remainingReq*UserBill300;
                remainingReq=0;
            }
        }
        else{
            totalAdvBillSavings+=remainingReq*UserBill100;
            remainingReq=0;
        }
        
        const advBillRec = totalCostOfSetup/(totalAdvBillSavings); // More Accurate ROI Period
        
        // Recovery time in years
        recoveryTimeY = Math.floor(advBillRec/12);
        recoveryTimeM = Math.floor(advBillRec-12*recoveryTimeY);
    }

    // Assume you have fetched the data and calculated results
    const areaOfSolarPanel = solArrAreaReq; // Replace with your calculated value
    const totalCost = totalCostOfSetup; // Replace with your calculated value
    // const batteryCost = 50; // Replace with your calculated value
    const solarArrayCost = solArrCost; // Replace with your calculated value
    const recoveryYears = recoveryTimeY; // Replace with your calculated value
    const recoveryMonths = recoveryTimeM; // Replace with your calculated value

    // Display result in the card
    resultTitle.innerText = `Area of Solar Panel: ${areaOfSolarPanel} sq. meters`;
    resultText.innerHTML = `Total Costs: ₹${totalCost}<br>
                            - Battery Cost: ₹${batteryCost}<br>
                            - Solar Array Cost: ₹${solarArrayCost}<br>
                            Recovery in ${recoveryYears} Years and ${recoveryMonths} Months`;

    // Hide the form section and show the result card
    hideform.classList.add('hidden');
    resultCard.classList.remove('hidden');

        printPdf.addEventListener("click",()=>{
          try {
        // Modern browser approach using print() with optional PDF generation:
        if (window.print && window.print().includes('PDF')) {
          console.log('Page printed as PDF using native browser functionality.');
          return; // Exit if user initiated PDF printing
        }

        // Fallback for older browsers or if user didn't choose PDF:
        window.print();
      } catch (error) {
        console.error('Error printing the page:', error);
        alert('Failed to print the page. Please try again or check your browser settings.');
      }
        })

        })
        .catch(error => {
            console.error('Error:', error);
            // Handle the error, show an alert, or provide user feedback
        });

    // Area and Cost

    // const localSolPower = 0.2; // MongoDB Database SolPower Table - Argument = Location
    // const localSolArrRate = 30; // MongoDB Database SolarPanelCost Table - Argument = Location

    // const userPowerReqPerDay = (userUnitReq * 1.5)/30; // 1.5 = peak power adjustment
    // const batteryCap = 0.8 * userPowerReqPerDay; // Batery req = 3x daily capacity (3D support)

    // const batteryCost = batteryCap * 33000; // MongoDB Database Battery Table - Argument = batteryCap

    // const solArrAreaReq = userPowerReqPerDay/localSolPower; 
    // const solArrCost = solArrAreaReq * localSolArrRate;

    // const totalCostOfSetup = batteryCost + solArrCost; // Total cost = battery + solar array
    // let UserBill, recoveryTimeY, recoveryTimeM, UserBillFixed, UserBill100, UserBill300, UserBill500, UserBill500Plus;
    // if(!advancedOptions){
    //     UserBill = formData?.get('cost'); // User Input basic

    //     // Recovery of Payment
    //     const basicBillRec = totalCostOfSetup/(UserBill*0.9) //Exclude Fixed cost on 10% assumption 

    //     recoveryTimeY = Math.floor(basicBillRec/12);
    //     recoveryTimeM = Math.floor(basicBillRec-12*recoveryTimeY);
    // }
    // else{
    //     UserBillFixed = advancedOptions ? document.getElementById('fixed-cost').value : ''; // Advanced User Input
    //     UserBill100 =  advancedOptions ? document.getElementById('cost-per-unit-100').value : ''; // Advanced User Input
    //     UserBill300 = advancedOptions ? document.getElementById('cost-per-unit-300').value : ''; // Advanced User Input
    //     UserBill500 = advancedOptions ? document.getElementById('cost-per-unit-500').value : ''; // Advanced User Input
    //     UserBill500Plus = 50; // Advanced User Input
        
    //     // Advanced
    //     let remainingReq = userUnitReq;
    //     let totalAdvBillSavings = 0;
    //     if(remainingReq>100){
    //         totalAdvBillSavings+=100*UserBill100;
    //         remainingReq-=100;
    //         if(remainingReq>200){
    //             totalAdvBillSavings+=200*UserBill300;
    //             remainingReq-=200;
    //             if(remainingReq>200){
    //                 totalAdvBillSavings+=200*UserBill500;
    //                 remainingReq-=200;
    //                 if(remainingReq>0){
    //                     totalAdvBillSavings+=remainingReq*UserBill500Plus;
    //                     remainingReq=0;
    //                 }
    //             }
    //             else{
    //                 totalAdvBillSavings+=remainingReq*UserBill500;
    //                 remainingReq=0;
    //             }
    //         }
    //         else{
    //             totalAdvBillSavings+=remainingReq*UserBill300;
    //             remainingReq=0;
    //         }
    //     }
    //     else{
    //         totalAdvBillSavings+=remainingReq*UserBill100;
    //         remainingReq=0;
    //     }
        
    //     const advBillRec = totalCostOfSetup/(totalAdvBillSavings); // More Accurate ROI Period
        
    //     // Recovery time in years
    //     recoveryTimeY = Math.floor(advBillRec/12);
    //     recoveryTimeM = Math.floor(advBillRec-12*recoveryTimeY);
    // }

    // // Assume you have fetched the data and calculated results
    // const areaOfSolarPanel = solArrAreaReq; // Replace with your calculated value
    // const totalCost = totalCostOfSetup; // Replace with your calculated value
    // // const batteryCost = 50; // Replace with your calculated value
    // const solarArrayCost = solArrCost; // Replace with your calculated value
    // const recoveryYears = recoveryTimeY; // Replace with your calculated value
    // const recoveryMonths = recoveryTimeM; // Replace with your calculated value

    // // Display result in the card
    // resultTitle.innerText = `Area of Solar Panel: ${areaOfSolarPanel} sq. meters`;
    // resultText.innerHTML = `Total Costs: ₹${totalCost}<br>
    //                         - Battery Cost: ₹${batteryCost}<br>
    //                         - Solar Array Cost: ₹${solarArrayCost}<br>
    //                         Recovery in ${recoveryYears} Years and ${recoveryMonths} Months`;

    // // Hide the form section and show the result card
    // hideform.classList.add('hidden');
    // resultCard.classList.remove('hidden');

    //     printPdf.addEventListener("click",()=>{
    //       try {
    //     // Modern browser approach using print() with optional PDF generation:
    //     if (window.print && window.print().includes('PDF')) {
    //       console.log('Page printed as PDF using native browser functionality.');
    //       return; // Exit if user initiated PDF printing
    //     }

    //     // Fallback for older browsers or if user didn't choose PDF:
    //     window.print();
    //   } catch (error) {
    //     console.error('Error printing the page:', error);
    //     alert('Failed to print the page. Please try again or check your browser settings.');
    //   }
    //     })

    // Perform any additional actions, such as form validation and redirect to result HTML
    // Example: window.location.href = 'result.html';
    
});
