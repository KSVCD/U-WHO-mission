
const TOTAL_MISSIONS = 3;
const ADMIN_CODE = "261111";

// 저장된 진행 상태 불러오기
let cleared = JSON.parse(localStorage.getItem("uWhoMissionCleared") || "[]").map(Number);
let isRedeemed = localStorage.getItem("uWhoRewardRedeemed") === "true";

function save() {
  localStorage.setItem("uWhoMissionCleared", JSON.stringify(cleared));
  updateUI();
}

function isCleared(n) {
  return cleared.includes(Number(n));
}

// 화면 업데이트
function updateUI() {
  const blockedOverlay = document.getElementById("blockedOverlay");

  // 이미 보상을 수령한 경우
  if (isRedeemed) {
    if (blockedOverlay) blockedOverlay.style.display = "flex";
    return;
  } else {
    if (blockedOverlay) blockedOverlay.style.display = "none";
  }

  const count = cleared.length;

  const progressText = document.getElementById("progressText");
  const flowerCenterText = document.getElementById("flowerCenterText");

  if (progressText) {
    progressText.textContent = `${count} / ${TOTAL_MISSIONS}`;
  }

  if (flowerCenterText) {
    flowerCenterText.textContent = count === TOTAL_MISSIONS ? "✿" : `${count}/3`;
  }

  // 꽃잎 업데이트
  [1, 2, 3].forEach(n => {
    const petal = document.getElementById(`petal${n}`);

    if (petal) {
      if (isCleared(n)) {
        petal.classList.add("active");
      } else {
        petal.classList.remove("active");
      }
    }
  });

  // 구역별 완료 상태 업데이트
  const zones = ["A", "B", "C"];

  zones.forEach((z, idx) => {
    const el = document.getElementById(`zone${z}`);

    if (el) {
      if (isCleared(idx + 1)) {
        el.classList.add("done");
        el.querySelector("strong").textContent = "완료 ✓";
      } else {
        el.classList.remove("done");
        el.querySelector("strong").textContent = "미완료";
      }
    }
  });

  // 보상 영역 표시
  const rewardSec = document.getElementById("rewardSection");

  if (rewardSec) {
    rewardSec.style.display = count === TOTAL_MISSIONS ? "block" : "none";
  }
}

// QR 스캔 처리
function processQR(n) {
  if (isRedeemed) return;

  n = Number(n);

  if (n >= 1 && n <= 3) {
    if (!isCleared(n)) {
      cleared.push(n);
      cleared.sort((a, b) => a - b);

      save();

      setTimeout(() => {
        alert(`🎉 ZONE 0${n} 도장을 획득했습니다!`);

        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 100);
    }
  }
}

// 졸준위 수령 확인
function verifyAdminCode() {
  if (isRedeemed) {
    alert("이미 수령 완료 처리된 상태입니다.");
    return;
  }

  const inputCode = prompt("졸준위 전용 인증 코드를 입력하세요:");

  if (inputCode === null) return;

  if (inputCode.trim() === ADMIN_CODE) {
    if (confirm("수령 완료 처리하시겠습니까?\n처리 후에는 중복 수령 방지를 위해 더 이상 사용할 수 없습니다.")) {

      isRedeemed = true;

      localStorage.setItem("uWhoRewardRedeemed", "true");

      alert("성공적으로 수령 완료 처리되었습니다.");

      updateUI();
    }
  } else {
    alert("인증 코드가 올바르지 않습니다.");
  }
}

// 진행 상태 및 수령 기록 초기화
function verifyResetCode() {
  const inputCode = prompt("초기화 인증 코드를 입력하세요:");

  if (inputCode === null) return;

  if (inputCode.trim() === ADMIN_CODE) {
    if (confirm("정말 모든 진행 상태와 수령 기록을 초기화하시겠습니까?")) {

      cleared = [];
      isRedeemed = false;

      localStorage.removeItem("uWhoMissionCleared");
      localStorage.removeItem("uWhoRewardRedeemed");

      alert("초기화되었습니다.");

      updateUI();

      window.location.reload();
    }
  } else {
    alert("인증 코드가 올바르지 않습니다.");
  }
}

// 페이지 로드
document.addEventListener("DOMContentLoaded", () => {
  const n = new URLSearchParams(window.location.search).get("mission");

  if (n) {
    processQR(n);
  }

  updateUI();
});
