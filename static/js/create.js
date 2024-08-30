// HTML 요소 가져오기
let email = document.getElementById("email");
let password = document.getElementById("password");
let password_check = document.getElementById("password-check");

let signupForm = document.querySelector("form.login-form");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault(); // 기본 폼 제출 동작 방지

  // 비밀번호 일치 확인
  if (password.value !== password_check.value) {
    alert("비밀번호가 일치하지 않습니다. 다시 입력해주세요.");
    return;
  }

  // 사용자 데이터를 서버로 전송하기 위한 요청 설정
  let formData = new FormData();
  formData.append("email", email.value);
  formData.append("password", password.value);
  formData.append("password-check", password_check.value);
  formData.append("phone", document.getElementById("phone").value);

  // Fetch API를 사용하여 서버로 POST 요청
 
  fetch("/register", {
    method: "POST",
    body: formData,
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
        alert(data.error);
    } else {
        alert(data.message);
        window.location.href = "/select";  // 회원가입 성공 후 select.html로 이동
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
  });
