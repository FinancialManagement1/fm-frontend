import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
  CAD: "CA$", AUD: "A$", CHF: "CHF", CNY: "¥", AED: "د.إ",
  SAR: "﷼", SGD: "S$", MYR: "RM", THB: "฿", KRW: "₩",
  BRL: "R$", MXN: "MX$", ZAR: "R", NGN: "₦", PKR: "₨",
  BDT: "৳", NZD: "NZ$", HKD: "HK$", SEK: "kr", NOK: "kr",
};

export function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState("EUR");
  const [currencySymbol, setCurrencySymbol] = useState("€");

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const code = await AsyncStorage.getItem("currency");
        if (code) {
          setCurrencyCode(code);
          setCurrencySymbol(CURRENCY_SYMBOLS[code] || code);
        }
      } catch (err) {
        console.error("useCurrency error:", err);
      }
    };
    loadCurrency();
  }, []);

  const getSymbol = (code) => CURRENCY_SYMBOLS[code] || code;

  return { currencyCode, currencySymbol, getSymbol };
}