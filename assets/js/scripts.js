const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
  const cached = localStorage.getItem(path);
  if (cached) {
    $(selector).innerHTML = cached;
  }

  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      if (html !== cached) {
        $(selector).innerHTML = html;
        localStorage.setItem(path, html);
      }
    })
    .finally(() => {
      window.dispatchEvent(new Event("template-loaded"));
    });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
  if (!element) return true;

  if (window.getComputedStyle(element).display === "none") {
    return true;
  }

  let parent = element.parentElement;
  while (parent) {
    if (window.getComputedStyle(parent).display === "none") {
      return true;
    }
    parent = parent.parentElement;
  }

  return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
  if (isHidden($(".js-dropdown-list"))) return;

  const items = $$(".js-dropdown-list > li");

  items.forEach((item) => {
    const arrowPos = item.offsetLeft + item.offsetWidth / 2;
    item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
  });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener("resize", calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener("template-loaded", calArrowPos);

/**
 * Giữ active menu khi hover
 *
 * Cách dùng:
 * 1. Thêm class "js-menu-list" vào thẻ ul menu chính
 * 2. Thêm class "js-dropdown" vào class "dropdown" hiện tại
 *  nếu muốn reset lại item active khi ẩn menu
 */
window.addEventListener("template-loaded", handleActiveMenu);

function handleActiveMenu() {
  const dropdowns = $$(".js-dropdown");
  const menus = $$(".js-menu-list");
  const activeClass = "menu-column__item--active";

  const removeActive = (menu) => {
    menu.querySelector(`.${activeClass}`)?.classList.remove(activeClass);
  };

  const init = () => {
    menus.forEach((menu) => {
      const items = menu.children;
      if (!items.length) return;

      removeActive(menu);
      if (window.innerWidth > 991) items[0].classList.add(activeClass);

      Array.from(items).forEach((item) => {
        item.onmouseenter = () => {
          if (window.innerWidth <= 991) return;
          removeActive(menu);
          item.classList.add(activeClass);
        };
        item.onclick = () => {
          if (window.innerWidth > 991) return;
          removeActive(menu);
          item.classList.add(activeClass);
          item.scrollIntoView();
        };
      });
    });
  };

  init();

  dropdowns.forEach((dropdown) => {
    dropdown.onmouseleave = () => init();
  });
}

/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener("template-loaded", initJsToggle);

function initJsToggle() {
  $$(".js-toggle").forEach((button) => {
    const target = button.getAttribute("toggle-target");
    if (!target) {
      document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
    }
    button.onclick = (e) => {
      e.preventDefault();
      if (!$(target)) {
        return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
      }
      const isHidden = $(target).classList.contains("hide");

      requestAnimationFrame(() => {
        $(target).classList.toggle("hide", !isHidden);
        $(target).classList.toggle("show", isHidden);
      });
    };

    //kích ra ngoài from filter sẽ biến mất
    document.onclick = (e) => {
      if (!e.target.closest(target)) {
        const isHidden = $(target).classList.contains("hide");
        if (!isHidden) {
          button.click();
        }
      }
    };
  });
}

window.addEventListener("template-loaded", () => {
  const links = $$(".js-dropdown-list > li > a");

  links.forEach((link) => {
    link.onclick = () => {
      if (window.innerWidth > 991) return;
      const item = link.closest("li");
      item.classList.toggle("navbar__item--active");
    };
  });
});

//-----Code chức năng Filter (bộ lọc tìm kiếm giá cả)-----//
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".filter__form-slider");
  const minInput = document.querySelectorAll(".filter__form-input")[0];
  const maxInput = document.querySelectorAll(".filter__form-input")[1];

  const sliderWidth = slider.offsetWidth;
  let minValue = 10; // Initial percentage for min
  let maxValue = 60; // Initial percentage for max
  const minPrice = 0; // Minimum price
  const maxPrice = 1000000; // Maximum price
  const step = 5; // Minimum step between values

  // Round value to the nearest thousand
  function roundToThousands(value) {
    return Math.round(value / 1000) * 1000;
  }

  // Update slider position and input values
  function updateSlider() {
    slider.style.setProperty("--min-value", `${minValue}%`);
    slider.style.setProperty("--max-value", `${100 - maxValue}%`);

    const minPriceValue = roundToThousands(minPrice + ((maxPrice - minPrice) * minValue) / 100);
    const maxPriceValue = roundToThousands(minPrice + ((maxPrice - minPrice) * maxValue) / 100);

    minInput.value = `${minPriceValue.toLocaleString()}đ`;
    maxInput.value = `${maxPriceValue.toLocaleString()}đ`;
  }

  // Handle slider dragging
  function handleDrag(e, type) {
    const rect = slider.getBoundingClientRect();
    const clickX = Math.min(Math.max(e.clientX - rect.left, 0), sliderWidth);
    const percent = (clickX / sliderWidth) * 100;

    if (type === "min") {
      minValue = Math.min(percent, maxValue - step);
    } else if (type === "max") {
      maxValue = Math.max(percent, minValue + step);
    }
    updateSlider();
  }

  // Handle slider click
  slider.addEventListener("click", (e) => {
    const rect = slider.getBoundingClientRect();
    const clickX = Math.min(Math.max(e.clientX - rect.left, 0), sliderWidth);
    const percent = (clickX / sliderWidth) * 100;

    if (Math.abs(percent - minValue) < Math.abs(percent - maxValue)) {
      minValue = Math.min(percent, maxValue - step);
    } else {
      maxValue = Math.max(percent, minValue + step);
    }
    updateSlider();
  });

  // Handle mouse down and dragging
  slider.addEventListener("mousedown", (e) => {
    const rect = slider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isNearMin = clickX <= (minValue / 100) * sliderWidth + 20;
    const isNearMax = clickX >= (maxValue / 100) * sliderWidth - 20;

    if (!isNearMin && !isNearMax) return;

    const type = isNearMin ? "min" : "max";

    function onMouseMove(event) {
      handleDrag(event, type);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // Initialize slider
  updateSlider();
});
