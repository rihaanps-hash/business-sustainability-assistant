(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("auth-form");
  const message = $("form-message");
  const languageSelect = $("auth-language");
  let mode = "signin";
  if (localStorage.getItem("kiranaKeeperLanguage")) languageSelect.value = localStorage.getItem("kiranaKeeperLanguage");

  const copy = {
    en: {
      eyebrow: {signin:"WELCOME BACK", signup:"GET STARTED"},
      heading: {signin:"Sign in to your shop", signup:"Create your shop account"},
      subtitle: {signin:"Enter your details to continue to Kirana Keeper.", signup:"Set up an account for your shop workspace."},
      signin:"Sign in", signup:"Create account", fullName:"Your name", shopName:"Shop name",
      email:"Email address", password:"Password", confirmPassword:"Confirm password",
      forgot:"Forgot password?", show:"Show", hide:"Hide", submitSignin:"Sign in",
      submitSignup:"Create account", required:"Please fill in all required fields.",
      invalidEmail:"Please enter a valid email address.", shortPassword:"Use a password with at least 8 characters.",
      mismatch:"The passwords do not match.", demo:"This is the login-page UI only. Secure sign-in and account creation will work after Supabase Auth is connected.",
      forgotDemo:"Password recovery will be enabled when Supabase Auth is connected.",
      language:"Language", privacy:"Your shop records should stay private. Secure account authentication will be connected in the next setup step.", brandEyebrow:"YOUR SHOP, IN GOOD HANDS", brandHeading:"A little more in order, every day.", brandDescription:"Keep track of stock, sales and expenses in one calm, simple workspace.", brandFoot:"Made for neighbourhood shops · India", namePlaceholder:"e.g. Ravi Kumar", shopPlaceholder:"e.g. Sri Lakshmi Kirana", emailPlaceholder:"you@example.com", passwordPlaceholder:"At least 8 characters", confirmPlaceholder:"Enter password again", divider:"YOUR BUSINESS, YOUR SPACE", pageTitle:"Sign in · Kirana Keeper"
    },
    hi: {
      eyebrow:{signin:"वापसी पर स्वागत है",signup:"शुरू करें"},
      heading:{signin:"अपनी दुकान में लॉग इन करें",signup:"अपनी दुकान का खाता बनाएँ"},
      subtitle:{signin:"Kirana Keeper जारी रखने के लिए अपना विवरण दर्ज करें।",signup:"अपनी दुकान के लिए खाता बनाएँ।"},
      signin:"लॉग इन",signup:"खाता बनाएँ",fullName:"आपका नाम",shopName:"दुकान का नाम",
      email:"ईमेल पता",password:"पासवर्ड",confirmPassword:"पासवर्ड की पुष्टि करें",
      forgot:"पासवर्ड भूल गए?",show:"दिखाएँ",hide:"छिपाएँ",submitSignin:"लॉग इन",submitSignup:"खाता बनाएँ",
      required:"कृपया सभी ज़रूरी फ़ील्ड भरें.",invalidEmail:"कृपया सही ईमेल पता दर्ज करें.",
      shortPassword:"कम से कम 8 अक्षरों का पासवर्ड रखें.",mismatch:"दोनों पासवर्ड मेल नहीं खाते.",
      demo:"यह अभी केवल लॉगिन पेज का इंटरफ़ेस है। Supabase Auth जोड़ने के बाद सुरक्षित लॉगिन और खाता बनाना काम करेगा.",
      forgotDemo:"Supabase Auth जुड़ने के बाद पासवर्ड रिकवरी चालू होगी.",language:"भाषा",
      privacy:"आपकी दुकान के रिकॉर्ड निजी रहने चाहिए। अगले चरण में सुरक्षित लॉगिन जोड़ा जाएगा।", brandEyebrow:"आपकी दुकान, भरोसे के साथ", brandHeading:"हर दिन, थोड़ा और व्यवस्थित।", brandDescription:"स्टॉक, बिक्री और खर्चों का हिसाब एक आसान जगह पर रखें।", brandFoot:"मोहल्ले की दुकानों के लिए · भारत", namePlaceholder:"जैसे रवि कुमार", shopPlaceholder:"जैसे श्री लक्ष्मी किराना", emailPlaceholder:"आपका ईमेल", passwordPlaceholder:"कम से कम 8 अक्षर", confirmPlaceholder:"पासवर्ड फिर दर्ज करें", divider:"आपका व्यवसाय, आपकी जगह", pageTitle:"लॉग इन · किराना कीपर"
    },
    te: {
      eyebrow:{signin:"తిరిగి స్వాగతం",signup:"ప్రారంభించండి"},
      heading:{signin:"మీ దుకాణంలోకి లాగిన్ అవ్వండి",signup:"మీ దుకాణ ఖాతాను సృష్టించండి"},
      subtitle:{signin:"Kirana Keeper కొనసాగించడానికి మీ వివరాలను నమోదు చేయండి.",signup:"మీ దుకాణం కోసం ఖాతాను సృష్టించండి."},
      signin:"లాగిన్",signup:"ఖాతా సృష్టించండి",fullName:"మీ పేరు",shopName:"దుకాణం పేరు",
      email:"ఈమెయిల్ చిరునామా",password:"పాస్‌వర్డ్",confirmPassword:"పాస్‌వర్డ్‌ను నిర్ధారించండి",
      forgot:"పాస్‌వర్డ్ మర్చిపోయారా?",show:"చూపించు",hide:"దాచు",submitSignin:"లాగిన్",submitSignup:"ఖాతా సృష్టించండి",
      required:"దయచేసి అవసరమైన అన్ని వివరాలను నమోదు చేయండి.",invalidEmail:"సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి.",
      shortPassword:"కనీసం 8 అక్షరాల పాస్‌వర్డ్ ఉపయోగించండి.",mismatch:"పాస్‌వర్డ్‌లు సరిపోలడం లేదు.",
      demo:"ఇది ప్రస్తుతం లాగిన్ పేజీ రూపకల్పన మాత్రమే. Supabase Auth కలిపిన తర్వాత సురక్షిత లాగిన్, ఖాతా సృష్టింపు పనిచేస్తాయి.",
      forgotDemo:"Supabase Auth కలిపిన తర్వాత పాస్‌వర్డ్ రికవరీ అందుబాటులో ఉంటుంది.",language:"భాష",
      privacy:"మీ దుకాణ రికార్డులు ప్రైవేట్‌గా ఉండాలి. తదుపరి దశలో సురక్షిత లాగిన్ కలుపుతాము.", brandEyebrow:"మీ దుకాణం, భద్రతగా", brandHeading:"ప్రతి రోజు మరింత క్రమబద్ధంగా.", brandDescription:"స్టాక్, అమ్మకాలు, ఖర్చులను ఒకే సులభమైన ప్రదేశంలో నిర్వహించండి.", brandFoot:"పరిసర దుకాణాల కోసం · భారత్", namePlaceholder:"ఉదా. రవి కుమార్", shopPlaceholder:"ఉదా. శ్రీ లక్ష్మి కిరాణా", emailPlaceholder:"మీ ఈమెయిల్", passwordPlaceholder:"కనీసం 8 అక్షరాలు", confirmPlaceholder:"పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి", divider:"మీ వ్యాపారం, మీ స్థలం", pageTitle:"లాగిన్ · కిరాణా కీపర్"
    }
  };

  function t(key) { return copy[languageSelect.value]?.[key] ?? copy.en[key] ?? key; }
  function showMessage(text) {
    message.textContent = text;
    message.classList.add("is-visible");
  }
  function clearMessage() {
    message.textContent = "";
    message.classList.remove("is-visible");
  }
  function setMode(next) {
    mode = next;
    const signup = mode === "signup";
    $("signin-tab").classList.toggle("is-active", !signup);
    $("signup-tab").classList.toggle("is-active", signup);
    $("signin-tab").setAttribute("aria-selected", String(!signup));
    $("signup-tab").setAttribute("aria-selected", String(signup));
    $("name-field").hidden = !signup;
    $("shop-field").hidden = !signup;
    $("confirm-field").hidden = !signup;
    $("password").autocomplete = signup ? "new-password" : "current-password";
    $("form-eyebrow").textContent = t("eyebrow")[mode] || t("eyebrow").signin;
    $("auth-heading").textContent = t("heading")[mode] || t("heading").signin;
    $("auth-subtitle").textContent = t("subtitle")[mode] || t("subtitle").signin;
    $("submit-button").innerHTML = `${signup ? t("submitSignup") : t("submitSignin")} <span aria-hidden="true">→</span>`;
    $("forgot-button").hidden = signup;
    clearMessage();
  }
  function updateLanguage() {
    document.documentElement.lang = languageSelect.value;
    document.title = t("pageTitle");
    document.querySelector(".kk-language-control").setAttribute("aria-label", t("language"));
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = t(key);
    });
    $("signin-tab").textContent = t("signin");
    $("signup-tab").textContent = t("signup");
    $("forgot-button").textContent = t("forgot");
    $("toggle-password").textContent = $("password").type === "password" ? t("show") : t("hide");
    $("toggle-password").setAttribute("aria-label", $("password").type === "password" ? t("show") : t("hide"));
    $("privacy-note") && ($("privacy-note").textContent = t("privacy"));
    const brandEyebrow = document.querySelector(".kk-brand-copy .kk-eyebrow");
    if (brandEyebrow) brandEyebrow.textContent = t("brandEyebrow");
    const brandHeading = document.querySelector(".kk-brand-copy h1");
    if (brandHeading) {
      const heading = t("brandHeading");
      brandHeading.textContent = heading;
      const emphasis = document.createElement("em");
      if (languageSelect.value === "en") {
        brandHeading.textContent = "A little more in order, ";
        emphasis.textContent = "every day.";
        brandHeading.appendChild(emphasis);
      }
    }
    const brandDescription = document.querySelector(".kk-brand-copy p:not(.kk-eyebrow)");
    if (brandDescription) brandDescription.textContent = t("brandDescription");
    const brandFoot = document.querySelector(".kk-brand-foot"); if (brandFoot) brandFoot.textContent = t("brandFoot");
    const divider = document.querySelector(".kk-auth-divider span"); if (divider) divider.textContent = t("divider");
    $("full-name").placeholder = t("namePlaceholder");
    $("shop-name").placeholder = t("shopPlaceholder");
    $("email").placeholder = t("emailPlaceholder");
    $("password").placeholder = t("passwordPlaceholder");
    $("confirm-password").placeholder = t("confirmPlaceholder");
    localStorage.setItem("kiranaKeeperLanguage", languageSelect.value);
    setMode(mode);
  }

  $("signin-tab").addEventListener("click", () => setMode("signin"));
  $("signup-tab").addEventListener("click", () => setMode("signup"));
  $("toggle-password").addEventListener("click", () => {
    const input = $("password");
    input.type = input.type === "password" ? "text" : "password";
    $("toggle-password").textContent = input.type === "password" ? t("show") : t("hide");
    $("toggle-password").setAttribute("aria-label", input.type === "password" ? t("show") : t("hide"));
  });
  $("forgot-button").addEventListener("click", () => showMessage(t("forgotDemo")));
  languageSelect.addEventListener("change", () => {
    localStorage.setItem("kiranaKeeperLanguage", languageSelect.value);
    updateLanguage();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();
    const email = $("email").value.trim();
    const password = $("password").value;
    if (!email || !password || (mode === "signup" && (!$("full-name").value.trim() || !$("shop-name").value.trim() || !$("confirm-password").value))) {
      showMessage(t("required")); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage(t("invalidEmail")); return;
    }
    if (password.length < 8) {
      showMessage(t("shortPassword")); return;
    }
    if (mode === "signup" && password !== $("confirm-password").value) {
      showMessage(t("mismatch")); return;
    }
    // Demo-only gate: never store passwords. Replace this with Supabase Auth before production.
    sessionStorage.setItem("kiranaKeeperDemoSignedIn", "true");
    window.location.replace("index.html");
  });

  const savedLanguage = localStorage.getItem("kiranaKeeperLanguage");
  if (savedLanguage && ["en", "hi", "te"].includes(savedLanguage)) languageSelect.value = savedLanguage;
  $("year").textContent = new Date().getFullYear();
  updateLanguage();
  updateLanguage();
})();