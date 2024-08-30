function openLetter(button) {
  // letter.html로 이동
  const letter = button.closest(".letter");
  const letterId = letter.getAttribute("letter-id");
  sessionStorage.setItem("letterId", letterId);

  location.href = "/slowLetter";
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const letterList = document.getElementById("letter-list");
  const filter = document.getElementById("filter");
  let letters = Array.from(document.querySelectorAll(".letter"));

  // 모든 편지의 원래 위치를 기억하기 위해 인덱스를 부여
  letters.forEach((letter, index) => {
    letter.dataset.originalIndex = index;
  });

  searchInput.addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();
    letters.forEach((letter) => {
      const sender = letter.getAttribute("data-sender");
      if (sender.includes(searchValue)) {
        letter.style.display = "";
      } else {
        letter.style.display = "none";
      }
    });
  });

  // 정렬 기능
  filter.addEventListener("change", function () {
    const sortedLetters = sortLetters(this.value);
    renderLetters(sortedLetters);
  });

  // 편지 정렬 함수
  function sortLetters(order) {
    if (order === "oldest") {
      return letters.sort((a, b) => {
        const timeA = parseExtendedTime(
          a.querySelector(".letter-timer").getAttribute("data-time")
        );
        const timeB = parseExtendedTime(
          b.querySelector(".letter-timer").getAttribute("data-time")
        );
        return timeA - timeB; // 오래된 것부터 정렬
      });
    } else {
      return letters.sort((a, b) => {
        const timeA = parseExtendedTime(
          a.querySelector(".letter-timer").getAttribute("data-time")
        );
        const timeB = parseExtendedTime(
          b.querySelector(".letter-timer").getAttribute("data-time")
        );
        return timeB - timeA; // 최신 것부터 정렬
      });
    }
  }

  function renderLetters(sortedLetters) {
    letterList.innerHTML = ""; // 기존 편지 목록 초기화
    sortedLetters.forEach((letter) => {
      letterList.appendChild(letter); // 정렬된 편지를 리스트에 추가
    });
  }

  function parseExtendedTime(seconds) {
    let months = 0,
      days = 0,
      hours = 0,
      minutes = 0;
    const parts = seconds.split(" ");

    parts.forEach((part) => {
      if (part.includes("months")) months = parseInt(part);
      if (part.includes("days")) days = parseInt(part);
      if (part.includes("hours")) hours = parseInt(part);
      if (part.includes("minutes")) minutes = parseInt(part);
      if (part.includes("secs")) seconds = parseInt(part);
    });

    return (
      (((months * 30 + days) * 24 + hours) * 3600 + minutes) * 60 + seconds
    );
  }

  function formatExtendedTime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
  }

  function updateTimers() {
    letters.forEach((letter) => {
      const timerElement = letter.querySelector(".letter-timer");
      const openButton = letter.querySelector(".open-button");
      let remainingTime = parseInt(timerElement.getAttribute("data-time"));

      if (remainingTime > 0) {
        remainingTime -= 1;
        const formattedTime = formatExtendedTime(remainingTime);
        timerElement.setAttribute("data-time", remainingTime); // 남은 시간 업데이트
        timerElement.innerHTML = `${formattedTime} 남음`;

        openButton.classList.add("hidden"); // 버튼 숨김
      } else {
        if (!timerElement.classList.contains("revealed")) {
          timerElement.classList.add("revealed");
          const senderName = letter.getAttribute("data-sender");
          timerElement.innerHTML = `${senderName}이(가) 보낸 편지가 도착했습니다`;

          const previewElement = letter.querySelector(".letter-preview");
          previewElement.classList.remove("hidden");

          openButton.classList.remove("hidden");
          alert(`편지 제목: ${letter.querySelector(".letter-title").innerText}가 도착했습니다!`);
        }
      }
    });
  }

  // 타이머 업데이트를 1초마다 실행
  const timerInterval = setInterval(updateTimers, 1000);
});
