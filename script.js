const TOTAL_MISSIONS = 3;
const ADMIN_CODE = "261111"; // 졸준위 확인 및 초기화 인증 코드

let cleared = JSON.parse(localStorage.getItem("uWhoMissionCleared") || "[]").map(Number);
let isRedeemed = localStorage.getItem("uWhoRewardRedeemed") === "true";

function save() {
  localStorage.setItem("uWhoMissionCleared", JSON.stringify(cleared));
  updateUI();
}

function isCleared(n) {
  return cleared.includes(Number(n));
}

function updateUI() {
  // 이미 수령을 완료한 경우 차단 화면 표시
  const blockedOverlay = document.getElementById("blockedOverlay");
  if (isRedeemed) {
    if (blockedOverlay) blockedOverlay.style.display = "flex";
    return;
  } else {
    if (blockedOverlay) blockedOverlay.style.display = "none";
  }

  const count = cleared.length;
  
  const progressText = document.getElementById("progressText");
  const flowerCenterText = document.getElementById("flowerCenterText");
  if (progressText) progressText.textContent = `${count} / ${TOTAL_MISSIONS}`;
  if (flowerCenterText) flowerCenterText.textContent = count === TOTAL_MISSIONS ? "✿" : `${count}/3`;

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

  const rewardSec = document.getElementById("rewardSection");
  if (rewardSec) {
    rewardSec.style.display = count === TOTAL_MISSIONS ? "block" : "none";
  }
}

function processQR(n) {
  if (isRedeemed) return; // 이미 수령 완료된 상태라면 QR 스캔 차단

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

// 졸준위 수령 확인 코드 입력 및 차단 처리
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

// 비밀 코드를 입력받아 진행상태 및 수령 완료 상태를 초기화하는 함수
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
      window.location.reload(); // 페이지 새로고침으로 완벽히 복구
    }
  } else {
    alert("인증 코드가 올바르지 않습니다.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const n = new URLSearchParams(window.location.search).get("mission");
  if (n) {
    processQR(n);
  }
  updateUI();
});
