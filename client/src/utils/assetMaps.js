import medicinesBg from "../assets/medicines.jpg";
import paracetamolImg from "../assets/paracetamol.webp";
import azithromycinImg from "../assets/Azithromycin 250mg.webp";
import metforminImg from "../assets/Metformin 500mg.png";
import atorvastatinImg from "../assets/Atorvastatin 20mg.png";
import cetirizineImg from "../assets/Cetirizine 10mg.webp";
import hydrocortisoneImg from "../assets/Hydrocortisone Cream.webp";
import med1Img from "../assets/med1.avif";
import med2Img from "../assets/med2.png";
import med3Img from "../assets/med3.png";
import med4Img from "../assets/med4.avif";
import painManagementIcon from "../assets/pain management.jpg";
import antibioticsIcon from "../assets/antibiotcs.webp";
import cardiologyIcon from "../assets/cardiology.jpg";
import diabetesIcon from "../assets/diabeties.webp";
import dermatologyIcon from "../assets/dermatology.webp";
import respiratoryIcon from "../assets/respiratory.webp";

const productImageBySku = {
  "MF-PARA-500": paracetamolImg,
  "MF-AZI-250": azithromycinImg,
  "MF-MET-500": metforminImg,
  "MF-ATOR-20": atorvastatinImg,
  "MF-CET-10": cetirizineImg,
  "MF-HYD-CRM": hydrocortisoneImg,
  "S1-AMOX-500": med2Img,
  "S1-OME-20": med3Img,
  "S2-LOS-50": med4Img,
  "S2-SALB-INH": med1Img,
  "S3-INS-GLA": med3Img,
  "S3-CLIN-GEL": med4Img,
};

const productImageByName = {
  "Paracetamol 500mg": paracetamolImg,
  "Azithromycin 250mg": azithromycinImg,
  "Metformin 500mg": metforminImg,
  "Atorvastatin 20mg": atorvastatinImg,
  "Cetirizine 10mg": cetirizineImg,
  "Hydrocortisone Cream": hydrocortisoneImg,
  "Amoxicillin 500mg": med2Img,
  "Omeprazole 20mg": med3Img,
  "Losartan 50mg": med4Img,
  "Salbutamol Inhaler": med1Img,
  "Insulin Glargine 100IU": med3Img,
  "Clindamycin Gel": med4Img,
};

const categoryImageByName = {
  "Pain Management": painManagementIcon,
  Antibiotics: antibioticsIcon,
  Cardiology: cardiologyIcon,
  "Diabetes Care": diabetesIcon,
  Dermatology: dermatologyIcon,
  Respiratory: respiratoryIcon,
};

export const getProductImage = (product) => {
  if (!product) return medicinesBg;
  return productImageBySku[product.sku] || productImageByName[product.name] || medicinesBg;
};

export const getCategoryImage = (name) => {
  if (!name) return medicinesBg;
  return categoryImageByName[name] || medicinesBg;
};
