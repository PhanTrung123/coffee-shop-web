document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".auth__form");
  const usernameInput = document.querySelector("#username");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const confirmPasswordInput = document.querySelector("#confirm-password");

  const usernameError = document.querySelector(".form__group:nth-of-type(1) .form__error");
  const emailError = document.querySelector(".form__group:nth-of-type(2) .form__error");
  const passwordError = document.querySelector(".form__group:nth-of-type(3) .form__error");
  const confirmPasswordError = document.querySelector(".form__group:nth-of-type(4) .form__error");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;
    usernameError.classList.remove("active");
    emailError.classList.remove("active");
    passwordError.classList.remove("active");
    confirmPasswordError.classList.remove("active");

    if (usernameInput.value.trim() === "") {
      usernameError.classList.add("active");
      usernameInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "block";
      isValid = false;
    } else {
      usernameInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "none";
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailError.classList.add("active");
      emailInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "block";
      isValid = false;
    } else {
      emailInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "none";
    }

    if (passwordInput.value.trim().length < 6) {
      passwordError.classList.add("active");
      passwordInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "block";
      isValid = false;
    } else {
      passwordInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "none";
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordError.textContent = "The passwords entered do not match";
      confirmPasswordError.classList.add("active");
      confirmPasswordInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "block";
      isValid = false;
    } else {
      confirmPasswordInput.closest(".form__group").querySelector(".form__input-icon-warning").style.display = "none";
    }

    if (isValid) {
      const userData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      window.location.href = "./index-logined.html";
    }
  });
});
