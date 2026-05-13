const translations = {
  en: {
    appName: "Jarad Machinery & Electrical",
    dashboard: "Dashboard",
    products: "Products",
    vendors: "Vendors",
    customers: "Customers",
    quotations: "Quotations",
    billing: "Billing",
    payments: "Payments",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    username: "Username",
    password: "Password",
    welcome: "Welcome",
    addNew: "Add New",
    actions: "Actions",
    search: "Search",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete"
  },
  mr: {
    appName: "जराड मशिनरी अँड इलेक्ट्रिकल",
    dashboard: "डॅशबोर्ड",
    products: "उत्पादने",
    vendors: "विक्रेते",
    customers: "ग्राहक",
    quotations: "कोटेशन्स",
    billing: "बिलिंग",
    payments: "देयके",
    reports: "अहवाल",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    login: "लॉगिन",
    username: "युजरनेम",
    password: "पासवर्ड",
    welcome: "स्वागत",
    addNew: "नवीन जोडा",
    actions: "क्रिया",
    search: "शोधा",
    save: "जतन करा",
    cancel: "रद्द करा",
    edit: "संपादित करा",
    delete: "हटवा"
  }
};

function getLang() {
  return localStorage.getItem("lang") || "en";
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
  applyTranslations();
}

function t(key) {
  const lang = getLang();
  return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
}

document.addEventListener("DOMContentLoaded", applyTranslations);
