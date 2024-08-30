document.addEventListener("DOMContentLoaded", function () {
    // 날짜 관련 요소들
    const yearSelect = document.getElementById("year");
    const monthSelect = document.getElementById("month");
    const daySelect = document.getElementById("day");

    // 현재 날짜 기준으로 년, 월, 일 옵션 생성
    function populateDateSelectors() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        // 년도 옵션 생성
        for (let i = year; i <= year + 10; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }

        // 월 옵션 생성
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement("option");
            option.value = i.toString().padStart(2, "0");
            option.textContent = i.toString().padStart(2, "0");
            monthSelect.appendChild(option);
        }

        // 일 옵션 생성
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement("option");
            option.value = i.toString().padStart(2, "0");
            option.textContent = i.toString().padStart(2, "0");
            daySelect.appendChild(option);
        }

        // 현재 날짜 설정
        yearSelect.value = year;
        monthSelect.value = month.toString().padStart(2, "0");
        daySelect.value = day.toString().padStart(2, "0");
    }

    // 6개월 및 1년 버튼 클릭 시 날짜 자동 설정
    document.getElementById("6m").addEventListener("change", function () {
        if (this.checked) {
            const date = new Date();
            date.setMonth(date.getMonth() + 6);
            yearSelect.value = date.getFullYear();
            monthSelect.value = (date.getMonth() + 1).toString().padStart(2, "0");
            daySelect.value = date.getDate().toString().padStart(2, "0");
        }
    });

    document.getElementById("1y").addEventListener("change", function () {
        if (this.checked) {
            const date = new Date();
            date.setFullYear(date.getFullYear() + 1);
            yearSelect.value = date.getFullYear();
            monthSelect.value = (date.getMonth() + 1).toString().padStart(2, "0");
            daySelect.value = date.getDate().toString().padStart(2, "0");
        }
    });

    // 익명 체크박스에 따른 보내는 이 입력 필드 숨김
    document.getElementById("anonymous").addEventListener("change", function () {
        const senderSection = document.getElementById("sender");
        if (this.checked) {
            senderSection.style.display = "none";
        } else {
            senderSection.style.display = "block";
        }
    });

    // 초기화
    populateDateSelectors();
});
