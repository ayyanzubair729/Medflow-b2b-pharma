import medicinesBg from "../assets/medicines.jpg";
import paracetamolImg from "../assets/paracetamol.webp";
import azithromycinImg from "../assets/Azithromycin 250mg.webp";
import metforminImg from "../assets/Metformin 500mg.png";
import atorvastatinImg from "../assets/Atorvastatin 20mg.png";
import cetirizineImg from "../assets/Cetirizine 10mg.webp";
import hydrocortisoneImg from "../assets/Hydrocortisone Cream.webp";
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
};

const productImageByName = {
  "Paracetamol 500mg": paracetamolImg,
  "Azithromycin 250mg": azithromycinImg,
  "Metformin 500mg": metforminImg,
  "Atorvastatin 20mg": atorvastatinImg,
  "Cetirizine 10mg": cetirizineImg,
  "Hydrocortisone Cream": hydrocortisoneImg,
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
