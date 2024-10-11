// Function definition with passing two arrays
 export default function findCommonElement(array1: any[], array2: any[]) {

  // Loop for array1
  for (let i = 0; i < array1.length; i++) {

    // Loop for array2
    for (let j = 0; j < array2.length; j++) {

// Compare the element of each and every element from both of the arrays
      if (array1[i] === array2[j]) {

        // Return if common element found
        return true;
      }
    }
  }

   // Return if no common element exist
   return false;
 }