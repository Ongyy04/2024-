// 화면 전환
document.addEventListener("click", function () {
  // 첫 번째 페이지와 두 번째 페이지의 DOM 요소를 가져옵니다.
  const page1 = document.getElementById("page1");
  const page2 = document.getElementById("page2");

  // 첫 번째 페이지에 'hidden' 클래스를 추가하여 페이지를 숨깁니다.
  page1.classList.add("hidden");

  // 500ms(0.5초) 후에 첫 번째 페이지를 완전히 숨기고, 두 번째 페이지를 표시합니다.
  setTimeout(function () {
    page1.style.display = "none"; // 첫 번째 페이지의 display 속성을 none으로 설정하여 보이지 않게 합니다.
    page2.style.display = "flex"; // 두 번째 페이지의 display 속성을 flex로 설정하여 화면에 표시합니다.
    page2.classList.remove("hidden"); // 두 번째 페이지에서 'hidden' 클래스를 제거하여 정상적으로 표시되게 합니다.
  }, 500); // 500ms 후에 실행됩니다.
});

// 카카오 SDK 초기화
Kakao.init("46e82f2f8a5929e5352cf27290d36421"); // 카카오 SDK를 초기화하고 앱의 JavaScript 키를 사용하여 인증을 설정합니다.
console.log(Kakao.isInitialized()); // SDK가 정상적으로 초기화되었는지 콘솔에 출력하여 확인합니다.

function loginWithKakao() {
  Kakao.Auth.login({
      success: function (authObj) {
          console.log(authObj); // 인증 객체 로그 출력
          Kakao.Auth.setAccessToken(authObj.access_token);
          getInfo(); // 사용자 정보 요청
      },
      fail: function (err) {
          console.error(err);
          alert("카카오 로그인 실패");
      }
  });
}

function getInfo() {
  Kakao.API.request({
      url: '/v2/user/me',
      success: function (res) {
          var user_data = {
              kakao_id: res.id,
              nickname: res.kakao_account.profile.nickname,
          };

          // 서버로 사용자 정보를 POST 요청으로 전송
          fetch('/kakao/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(user_data)
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  // 여기에서 /kakao 경로로 리다이렉트
                  window.location.href = '/kakao'; // /kakao 경로로 이동
              } else {
                  alert('사용자 정보 저장 실패');
              }
          })
          .catch(error => console.error('Error:', error));
      },
      fail: function (error) {
          alert("카카오 로그인 실패" + JSON.stringify(error));
      }
  });
}
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();  // 폼의 기본 제출 동작을 막음

    var form = event.target;
    var formData = new FormData(form);

    fetch('/login', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        // 에러 메시지를 표시할 요소에 텍스트 삽입
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = data.error;
        errorMessageElement.classList.remove('hiddenme');
      } else if (data.success) {
        // 로그인 성공 시 서버에서 받은 URL로 리다이렉트
        window.location.href = data.redirect_url;
      }
    })
    .catch(error => console.error('Error:', error));
});


// 로그인 폼 처리
document.querySelector(".login-form").addEventListener("submit", function (e) {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  console.log("Email: ", email);
  console.log("Password: ", password);
});
