import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import moment from "moment"
import CryptoJS from 'crypto-js';
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
import { drawDOM, exportPDF } from "@progress/kendo-drawing";
import { Images } from "assets";

const PASS_SECRET_KEY = "Qb7C^sjNVfgd85^Wctv"
const PASS_START = "ygpugjqhpcan"
const PASS_END = "elrblpiijvjf"

// const type = process.env.REACT_APP_TYPE

export const encryptData = (data) => {
  const encryptedData = CryptoJS.AES.encrypt(data, PASS_SECRET_KEY).toString();
  return PASS_START + moment().unix() + PASS_END + encryptedData;
};

export const handleDownload = async (path, name) => {
  try {
    let url = process.env.REACT_APP_BASE_URL +`/download-media?path=${path}&name=${name}`
   
    window.open(url, '_blank');
    
  } catch (error) {
    
  }
}
// *Email Regex
export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// *Password Regex
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_~=@#$>.<,[{}()!%|'"`:;+*?&])[A-Za-z\d_~=@#$>.<,[{}()!%|'"`:;+*?&]{8,}$/

// *For Name Regex
export const nameRegex = /^[a-zA-Z\s]+$/

// *For Number Regex Contain Dot
export const numberRegex = /^[0-9.]+$/

// *For get file size into Bytes, KB and MB
export const getFileSize = (size) => {
  let fileSize
  if (size < 1024) {
    fileSize = `${size} Bytes`
  } else if (size < 1024 * 1024) {
    const fileSizeInKBs = size / 1024;
    fileSize = `${fileSizeInKBs.toFixed(2)} KB`
  } else {
    const fileSizeInMBs = size / (1024 * 1024);
    fileSize = `${fileSizeInMBs.toFixed(2)} MB`
  }
  return fileSize
}

// *For get formatted date
export const getFormattedDate = (date) => {
  if (!date) return
  const newDate = moment(date).format('MM-DD-YYYY')
  return newDate
}

// *For get formatted date
export const getYearMonthDateFormate = (date) => {
  if (!date) return
  const newDate = moment(date).format('MM-DD-YYYY')
  return newDate
}

// *For Compare Objects
export const compareObjects = (obj1, obj2) => {
  try {
    const changes = [];
    let object1 = { ...obj1 }
    let object2 = { ...obj2 }
    for (const key in object1) {
      if (object1.hasOwnProperty(key)) {

        // *For the key value is picture 
        if (key.includes('pictures')) {
          const checkData = object1[key].length !== object2[key].length
          const comparePicture = object2[key].some(item => !object1[key].includes(item));
          if (comparePicture || checkData) {
            let obj = {
              key: key,
              prevValue: object1[key],
              updateValue: object2[key]
            }
            changes.push(obj);
          }
        } else {
          // *Check the key value is date or string
          object1[key] = key.includes('date') ? getFormattedDate(object1[key]) : object1[key]
          object2[key] = key.includes('date') ? getFormattedDate(object2[key]) : object2[key]
          if (!object2.hasOwnProperty(key)) {
            // *Property exists in object1 but not in object2
            changes.push(`'${key}'`);
          } else if (object1[key] !== object2[key]) {
            // *Property exists in both objects, but values differ
            let obj = {
              key: key,
              prevValue: object1[key],
              updateValue: object2[key]
            }
            changes.push(obj);
          }
        }
      }
    }

    return changes;
  } catch (error) {
    console.log("🚀 ~ file: index.js:86 ~ compareObjects ~ error:", error)
  }
}

// *For Compare Array Of Object
export const findDifferences = (arr1, arr2) => {
  const differences = [];

  for (let i = 0; i < arr1.length; i++) {
    let obj = {}
    const object1 = arr1[i];
    const object2 = arr2[i];

    for (const key in object1) {
      if (object1.hasOwnProperty(key)) {
        if (!object2.hasOwnProperty(key)) {
          // *Property exists in object1 but not in object2
        } else if (parseFloat(object1[key]) !== parseFloat(object2[key])) {
          // *Property exists in both objects, but values differ
          obj['costing_id'] = object1['costing_id']
          obj[key] = object1[key]
        }
      }
    }
    if (Object.keys(obj).length > 0) {
      differences.push(obj)
    }
  }

  return differences;
}

// *For Debounce
let debounceTimer;
export const Debounce = (func, delay = 500) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
};


// *For Debounce
let debounceTimer2;
export const Debounce2 = (func, delay = 2000) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
};


export const LedgerLinking = (page) => {
  if (page == 'booking_payment') {
    return 'payment-receipt'
  }
  else if (page == 'VCC') {
    return "vcc-deposited"
  }
  else if (page == 'gatepass') {
    return "gate-pass"
  }
  else if (page == 'booking') {
    return "invoice"
  }
  else if (page == 'vault_topup') {
    return "view-vault-top-up"
  }
  else if (page == 'vehicle_tt') {
    return "vehicle-tt-detail"
  }
  else if (page == 'tt') {
    return "tt-detail"
  }
  else if (page == 'ift_voucher') {
    return "fund-transfer-voucher-detail"
  }
  else if (page == 'receipt_voucher') {
    return "receipt-detail"
  }
  else if (page == 'payment_voucher') {
    return "voucher-detail"
  }
  else {
    return null


  }
}
// *For Download File
export const DownloadFile = (data) => {
  const imageSrc = data?.file.replace(/\/media\//, '')
  let fileName = imageSrc.split('_')
  fileName.shift()
  fileName.join('')
  const url = process.env.REACT_APP_IMAGE_BASE_URL + imageSrc
  let link = document.createElement('a')
  link.href = url
  link.download = data?.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// *For Generate PDF
export const GeneratePDF = (content, filename, height) => {
  const scale = 2; // Adjust the scale as needed for higher resolution

  html2canvas(content, { scale: scale, scrollX: 0, scrollY: 0 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png', 1.0); // Set quality to 1.0 for the highest quality
    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = height ? pdf.internal.pageSize.getHeight() : 0;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  });
};


export const handleExportWithComponent = (pdfExportComponent) => {
  pdfExportComponent.current.save();
};
export const handleExportWithComponent2 = (pdfExportComponent) => {
  pdfExportComponent.current.save();
};
export const CommaSeparator = (value) => {
  if (isNaN(value)) {
    return 0
  }
  else {
    let result = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2
    }).format(value)

    return result
  }



}

// *For Clean Type
export const CleanTypes = (types) => {

  const cleanedTypes = types.map(type => type.replace(/^[^/]*\//, ''));

  return cleanedTypes.join(', ')
}

// *For Add Child Routes in Navigation
export const addChildRoutes = (data) => {
  const newNav = []
  data.forEach(element => {
    let child = []
    if (element?.children) {
      element?.children.forEach(e => {
        child.push(e.route)
      });
    }
    let obj = { ...element, childRoute: child }
    newNav.push(obj)
  });
  return newNav
}

// *For Format Permission Data
export const formatPermissionData = (data) => {
  const permission = {}
  data.forEach(element => {
    if (element?.identifier) {
      permission[element?.identifier] = element?.permitted
    }
  });
  return permission
}

// *For Get Permissions Routes
export const getPermissionsRoutes = (data) => {
  let permissionsRoutes = [];
  
  const nestedFunc = (data) => {
    data.forEach(element => {
      if (element.route) {
        permissionsRoutes.push(element.route);
      }
      if (element?.children?.length > 0) {
        nestedFunc(element.children);
      }
    });
  };
  
  nestedFunc(data);
  console.log(permissionsRoutes, 'permissionsRoutes');
  
  return permissionsRoutes;
};



export let agencyType = {
  "TASHEEL":{
    imageUrl: Images.headerCenterLogoTasheel,
    category: "TASHEEL"
  },
  "AL-ADHEED":{
    imageUrl: Images.headerCenterLogoAdheed,
    category: "AL-ADHEED"
  },
}