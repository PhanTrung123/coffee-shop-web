// Kiểm tra xem nội dung từ tệp path đã được lưu trong localStorage chưa.
// Nếu có, hiển thị nội dung đó trong phần tử xác định bằng selector.
// Nếu chưa hoặc đã thay đổi, tải nội dung mới từ path, hiển thị nó, và lưu lại vào localStorage để dùng sau.

function load(selector, path) {
  const cached = localStorage.getItem(path);
  if (cached) {
    document.querySelector(selector).innerHTML = cached;
  }
  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      if (html !== cached) {
        document.querySelector(selector).innerHTML = html;
        localStorage.setItem(path, html);
      }
    });
}
