/* ============================================
   AMORA BEAUTY STUDIO
   SMART FRONTEND BEAUTY ASSISTANT
   HTML + CSS + VANILLA JAVASCRIPT
============================================ */

(() => {
  "use strict";

  /* ==========================================
     BUSINESS SETTINGS — EDIT THESE
  ========================================== */

  const CONFIG = {
    businessName: "Amora Beauty Studio",
    location: "Nsawam, Ghana",
    whatsappNumber: "233203261314",

    // Replace these with your real opening hours.
    openingHours: "",

    // Add your actual services and prices here if
    // your website does not use .service-card elements.
    services: [
      // Example:
      // {
      //   name: "Gel Nails",
      //   description: "Beautiful gel nail treatment",
      //   price: "GH₵100",
      //   keywords: ["gel", "nails", "manicure"]
      // }
    ]
  };

  /* ==========================================
     GET HTML ELEMENTS
  ========================================== */

  const widget = document.getElementById("amoraChatWidget");

  if (!widget) return;

  const toggle = widget.querySelector("#chatToggle");
  const panel = widget.querySelector("#chatPanel");
  const close = widget.querySelector("#chatClose");
  const messages = widget.querySelector("#chatMessages");
  const form = widget.querySelector("#chatForm");
  const input = widget.querySelector("#chatInput");
  const typing = widget.querySelector("#chatTyping");
  const suggestions = widget.querySelector("#chatSuggestions");
  const whatsappLink = widget.querySelector("#chatWhatsApp");

  if (
    !toggle ||
    !panel ||
    !messages ||
    !form ||
    !input ||
    !typing
  ) {
    console.error("Amora chatbot: Required HTML elements are missing.");
    return;
  }

  let replyTimer = null;

  /* ==========================================
     WHATSAPP
  ========================================== */

  function makeWhatsAppLink(message = "") {
    const number = CONFIG.whatsappNumber.replace(/\D/g, "");

    return (
      "https://wa.me/" +
      number +
      (message ? "?text=" + encodeURIComponent(message) : "")
    );
  }

  if (whatsappLink) {
    whatsappLink.href = makeWhatsAppLink(
      "Hello Amora Beauty Studio! I would like to make an enquiry."
    );
  }

  /* ==========================================
     OPEN AND CLOSE CHAT
  ========================================== */

  function openChat() {
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");

    input.focus();
  }

  function closeChat() {
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");

    toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openChat();
    } else {
      closeChat();
    }
  });

  if (close) {
    close.addEventListener("click", closeChat);
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      closeChat();
    }
  });

  /* ==========================================
     MESSAGE DISPLAY
     Uses textContent to prevent HTML injection.
  ========================================== */

  function addMessage(text, sender = "bot") {
    const bubble = document.createElement("div");

    bubble.className =
      sender === "user" ? "user-message" : "bot-message";

    bubble.textContent = text;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;

    return bubble;
  }

  function addBotMessageWithLink(text, linkText, url) {
    const bubble = document.createElement("div");
    bubble.className = "bot-message";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    paragraph.style.margin = "0 0 8px";

    const link = document.createElement("a");
    link.href = url;
    link.textContent = linkText;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    bubble.appendChild(paragraph);
    bubble.appendChild(link);
    messages.appendChild(bubble);

    messages.scrollTop = messages.scrollHeight;
  }

  /* ==========================================
     NORMALISE CUSTOMER QUESTIONS
  ========================================== */

  function normalise(text) {
    return text
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9\s₵]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasAny(text, phrases) {
    return phrases.some(phrase => text.includes(phrase));
  }

  /* ==========================================
     READ SERVICES FROM YOUR WEBSITE

     Supported card class: .service-card

     Recommended card structure:
     <div class="service-card">
       <h3>Gel Nails</h3>
       <p>Beautiful gel nail treatment</p>
       <span>GH₵100</span>
     </div>
  ========================================== */

  function getWebsiteServices() {
    const cards = document.querySelectorAll(".service-card");

    const websiteServices = Array.from(cards)
      .map(card => {
        const heading = card.querySelector(
          "h2, h3, h4, h5, .service-title"
        );

        const description = card.querySelector(
          "p, .service-description"
        );

        const priceElement = card.querySelector(
          ".price, .service-price, [data-price]"
        );

        const title = heading?.textContent.trim() || "";

        const descriptionText =
          description?.textContent.trim() || "";

        const price =
          priceElement?.getAttribute("data-price") ||
          priceElement?.textContent.trim() ||
          "";

        return {
          name: title,
          description: descriptionText,
          price: price,
          keywords: []
        };
      })
      .filter(service => service.name);

    return websiteServices;
  }

  function getAllServices() {
    const websiteServices = getWebsiteServices();

    if (websiteServices.length) {
      return websiteServices;
    }

    return CONFIG.services;
  }

  function formatService(service) {
    let result = service.name;

    if (service.description) {
      result += " — " + service.description;
    }

    if (service.price) {
      result += " | " + service.price;
    }

    return result;
  }

  function servicesResponse() {
    const services = getAllServices();

    if (!services.length) {
      return (
        "We would love to help you find the right beauty treatment! 💗 " +
        "Please contact our team on WhatsApp for the current service menu."
      );
    }

    return (
      "Here is what I found in our service menu:\n\n" +
      services.map(formatService).join("\n\n") +
      "\n\nWould you like to know more about a particular service?"
    );
  }

  function pricesResponse() {
    const services = getAllServices();

    const pricedServices = services.filter(service => service.price);

    if (!pricedServices.length) {
      return (
        "I'd be happy to help with our prices! 💗 " +
        "Our current prices are not available in the service data on this page. " +
        "Please message us on WhatsApp to confirm the price of your chosen treatment."
      );
    }

    return (
      "Here are the prices listed in our service menu:\n\n" +
      pricedServices
        .map(service => service.name + ": " + service.price)
        .join("\n") +
      "\n\nPlease contact us to confirm current prices before booking."
    );
  }

  /* ==========================================
     SERVICE RECOMMENDATIONS
  ========================================== */

  const RECOMMENDATIONS = [
    {
      keywords: [
        "nail", "manicure", "pedicure", "gel", "acrylic",
        "nail art", "french tip", "press on"
      ],
      label: "nail services",
      reply:
        "If you are looking for beautiful nails, our nail-related services may be a good place to start. 💅"
    },
    {
      keywords: [
        "hair", "hairstyle", "braid", "braids", "wig",
        "weave", "cornrow", "locs", "dreadlocks"
      ],
      label: "hair services",
      reply:
        "If you want a fresh look, let's explore the hair-related services available in our menu. ✨"
    },
    {
      keywords: [
        "face", "facial", "skin", "skincare", "glow",
        "cleanse", "beauty treatment"
      ],
      label: "skin and facial services",
      reply:
        "For a self-care session, we can look at any facial or skincare services listed in our menu. 🌸"
    },
    {
      keywords: [
        "makeup", "make up", "bridal", "wedding",
        "glam", "glamour"
      ],
      label: "makeup services",
      reply:
        "Getting ready for a special occasion? Let's check whether makeup services are available in our menu. 💄"
    },
    {
      keywords: [
        "lash", "lashes", "eyelash", "brow", "brows",
        "eyebrow"
      ],
      label: "lash and brow services",
      reply:
        "We can explore any lash or brow treatments included in our current service list. 💗"
    }
  ];

  function recommendationResponse(text) {
    const matched = RECOMMENDATIONS.find(category =>
      category.keywords.some(keyword => text.includes(keyword))
    );

    if (!matched) return null;

    const services = getAllServices();

    const matchingServices = services.filter(service => {
      const searchable = normalise(
        service.name + " " +
        service.description + " " +
        (service.keywords || []).join(" ")
      );

      return matched.keywords.some(keyword =>
        searchable.includes(normalise(keyword))
      );
    });

    if (matchingServices.length) {
      return (
        matched.reply +
        "\n\nYou could explore:\n" +
        matchingServices.map(formatService).join("\n\n") +
        "\n\nWould you like the prices or help booking?"
      );
    }

    return (
      matched.reply +
      "\n\nI can't confirm which specific treatments are available from the information on this page. " +
      "Please check our full service menu or contact us on WhatsApp."
    );
  }

  /* ==========================================
     BOOKING INTEGRATION
  ========================================== */

  function openBooking() {
    const modal = document.getElementById("bookingModal");

    if (modal) {
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
      return true;
    }

    const bookingButton = document.querySelector(
      "#openBooking, #openBooking2, [data-open-booking]"
    );

    if (bookingButton) {
      bookingButton.click();
      return true;
    }

    const bookingSection = document.querySelector("#booking");

    if (bookingSection) {
      bookingSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      return true;
    }

    return false;
  }

  function bookingResponse() {
    const opened = openBooking();

    if (opened) {
      return (
        "Let's get your appointment started! 💗 " +
        "I've opened the booking section. Please select your service and complete the form."
      );
    }

    return (
      "We'd love to help you book an appointment! 💗 " +
      "You can send us your preferred service and date on WhatsApp."
    );
  }

  /* ==========================================
     BUSINESS INFORMATION RESPONSES
  ========================================== */

  function hoursResponse() {
    if (CONFIG.openingHours.trim()) {
      return (
        "Our listed opening hours are:\n" +
        CONFIG.openingHours +
        "\n\nPlease contact us to confirm any holiday or special opening times."
      );
    }

    return (
      "I don't have confirmed opening hours available right now. " +
      "Please message our team on WhatsApp before visiting, and we'll help you check."
    );
  }

  function locationResponse() {
    return (
      "Amora Beauty Studio is listed in " + CONFIG.location + ". " +
      "For the exact address or directions, please contact us on WhatsApp."
    );
  }

  function contactResponse() {
    return (
      "We'd be happy to hear from you! 💗 " +
      "Tap the WhatsApp button below to contact Amora Beauty Studio directly."
    );
  }

  /* ==========================================
     UNDERSTAND CUSTOMER INTENT
  ========================================== */

  function getReply(rawQuestion) {
    const text = normalise(rawQuestion);

    if (!text) {
      return "Please type a question so I can help you. 💗";
    }

    /* Greetings */

    if (
      /^(hi|hello|hey|hiya|good morning|good afternoon|good evening|howdy)$/.test(text) ||
      hasAny(text, [
        "hello there",
        "hi amora",
        "hey amora",
        "good morning amora",
        "good afternoon amora",
        "good evening amora"
      ])
    ) {
      return (
        "Hello and welcome to Amora Beauty Studio! 💗 " +
        "I'm here to help you explore our services, prices and appointments. " +
        "What would you like to know?"
      );
    }

    /* Thanks */

    if (hasAny(text, [
      "thank you", "thanks", "thank u",
      "many thanks", "appreciate it"
    ])) {
      return (
        "You're very welcome! 💗 Thank you for considering Amora Beauty Studio. " +
        "Is there anything else I can help you with?"
      );
    }

    /* Goodbye */

    if (hasAny(text, [
      "goodbye", "bye", "see you later",
      "talk later", "thats all"
    ])) {
      return (
        "Thank you for chatting with Amora Beauty Studio! 💕 " +
        "We hope to welcome you soon. Have a lovely day!"
      );
    }

    /* Explicit service list questions */

    if (hasAny(text, [
      "what services", "list of services", "your services",
      "services do you offer", "what do you offer",
      "service menu", "show me your services",
      "available treatments", "what treatments"
    ])) {
      return servicesResponse();
    }

    /* Prices */

    if (hasAny(text, [
      "price", "prices", "how much", "cost of",
      "costs", "how much is", "how much are",
      "price list", "service charge", "charges",
      "service fee", "fees", "affordable", "expensive"
    ])) {
      return pricesResponse();
    }

    /* Booking */

    if (hasAny(text, [
      "book appointment", "make appointment",
      "make a booking", "book a service",
      "want to book", "i want an appointment",
      "schedule appointment", "reserve a time",
      "appointment booking", "booking form",
      "book me", "i need an appointment"
    ])) {
      return bookingResponse();
    }

    /* General appointment questions */

    if (hasAny(text, [
      "appointment", "booking", "book now",
      "reserve", "schedule a visit"
    ])) {
      return (
        "You can request an appointment with Amora Beauty Studio. 💗 " +
        "Would you like to open the booking form now?"
      );
    }

    /* Opening hours */

    if (hasAny(text, [
      "opening hours", "open today", "are you open",
      "when do you open", "when do you close",
      "closing time", "opening time", "working hours",
      "business hours", "what time do you open"
    ])) {
      return hoursResponse();
    }

    /* Location */

    if (hasAny(text, [
      "location", "address", "where are you",
      "where is your studio", "directions",
      "how do i get there", "where are you located"
    ])) {
      return locationResponse();
    }

    /* Contact */

    if (hasAny(text, [
      "whatsapp", "contact number", "phone number",
      "how can i contact", "contact you",
      "call you", "your number", "talk to someone",
      "speak to a person", "human agent", "real person"
    ])) {
      return contactResponse();
    }

    /* Payment */

    if (hasAny(text, [
      "payment", "pay with", "mobile money",
      "momo", "credit card", "debit card",
      "payment methods", "how do i pay"
    ])) {
      return (
        "For payment options, please contact Amora Beauty Studio directly. " +
        "I don't have confirmed payment-method information available here."
      );
    }

    /* Cancellation and rescheduling */

    if (hasAny(text, [
      "cancel appointment", "cancel my booking",
      "reschedule", "change my appointment",
      "move my booking", "missed appointment"
    ])) {
      return (
        "Need to change an appointment? No problem. 💗 " +
        "Please contact our team on WhatsApp with your booking details so we can assist you."
      );
    }

    /* Recommendations */

    const recommendation = recommendationResponse(text);

    if (recommendation) {
      return recommendation;
    }

    /* Compliments */

    if (hasAny(text, [
      "beautiful", "love your work", "you are the best",
      "nice website", "lovely", "amazing"
    ])) {
      return (
        "Thank you so much! 💗 We're delighted you're here. " +
        "Would you like to explore our beauty services?"
      );
    }

    /* Help */

    if (hasAny(text, [
      "help", "what can you do", "how does this work",
      "what can i ask"
    ])) {
      return (
        "I'm the Amora Beauty Studio assistant. 💗 I can help you with:\n\n" +
        "• Our services\n" +
        "• Service prices\n" +
        "• Beauty treatment suggestions\n" +
        "• Booking appointments\n" +
        "• Opening hours and location\n" +
        "• Contacting us on WhatsApp\n\n" +
        "What would you like to explore?"
      );
    }

    /* Fallback */

    return (
      "I'd love to help with that! 💗 I may not have the exact answer in my current information. " +
      "You can ask me about our services, prices, opening hours, location or appointments. " +
      "For personal assistance, please use the WhatsApp button below."
    );
  }

  /* ==========================================
     SMARTER RESPONSE HANDLING
  ========================================== */

  function showTyping() {
    typing.hidden = false;
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    typing.hidden = true;
  }

  function respond(question) {
    const reply = getReply(question);

    showTyping();

    if (replyTimer) {
      clearTimeout(replyTimer);
    }

    // Small delay to make the conversation feel natural.
    replyTimer = setTimeout(() => {
      hideTyping();
      addMessage(reply, "bot");
      replyTimer = null;
    }, 450 + Math.min(question.length * 8, 650));
  }

  /* ==========================================
     SEND MESSAGE
  ========================================== */

  form.addEventListener("submit", event => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) return;

    addMessage(question, "user");
    input.value = "";

    respond(question);
  });

  /* ==========================================
     QUICK REPLIES
  ========================================== */

  const QUICK_QUESTIONS = {
    services: "What services do you offer?",
    prices: "What are your prices?",
    booking: "Book appointment",
    hours: "What are your opening hours?"
  };

  widget.querySelectorAll("[data-question]").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.question;
      const question = QUICK_QUESTIONS[key];

      if (!question) return;

      addMessage(question, "user");

      if (key === "booking") {
        const reply = bookingResponse();
        showTyping();

        setTimeout(() => {
          hideTyping();
          addMessage(reply, "bot");
        }, 450);

        return;
      }

      respond(question);
    });
  });

  /* ==========================================
     SERVICE-BASED FOLLOW-UP SUGGESTIONS
  ========================================== */

  if (suggestions) {
    suggestions.addEventListener("click", event => {
      const button = event.target.closest("button");

      if (!button) return;

      // The data-question handler above handles these buttons.
      input.setAttribute("aria-label", "Type your message");
    });
  }

})();
